import json
import psycopg2
import uuid
from datetime import datetime

# Veritabanı bağlantı ayarları
DB_CONFIG = {
    'host': 'localhost',
    'database': 'telecom_vectordb',
    'user': 'telecom_user',
    'password': '4Lt0g',
    'port': 5435
}


def load_json_data(file_path):
    """JSON dosyasından verileri yükle"""
    with open(file_path, 'r', encoding='utf-8') as file:
        return json.load(file)


def insert_documents_to_db(json_data):
    """JSON verilerini PostgreSQL'e yükle"""

    try:
        # Veritabanına bağlan
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # Collection ID'sini al
        cursor.execute("SELECT uuid FROM langchain_pg_collection WHERE name = 'telecom_docs'")
        collection_result = cursor.fetchone()

        if not collection_result:
            print("Collection bulunamadı. Önce collection oluşturuluyor...")
            collection_id = str(uuid.uuid4())
            cursor.execute(
                "INSERT INTO langchain_pg_collection (uuid, name, cmetadata) VALUES (%s, %s, %s)",
                (collection_id, 'telecom_docs', json.dumps({"description": "Telecom FAQ and documentation"}))
            )
        else:
            collection_id = collection_result[0]

        # Mevcut verileri temizle (isteğe bağlı)
        print("Mevcut veriler temizleniyor...")
        cursor.execute("DELETE FROM langchain_pg_embedding WHERE collection_id = %s", (collection_id,))

        # Yeni verileri ekle
        print(f"Toplam {len(json_data)} kayıt ekleniyor...")

        for i, item in enumerate(json_data):
            # Her soru-cevap çiftini ayrı dokuman olarak ekle
            soru = item.get('soru', '')
            cevap = item.get('cevap', '')

            # Soru ve cevabı birleştir
            combined_text = f"Soru: {soru}\nCevap: {cevap}"

            # Metadata oluştur
            metadata = {
                'source': 'telecom_faq.json',
                'question': soru,
                'answer': cevap,
                'doc_id': f'faq_{i + 1}',
                'created_at': datetime.now().isoformat()
            }

            # Veritabanına ekle (embedding NULL olarak, daha sonra doldurulacak)
            cursor.execute("""
                           INSERT INTO langchain_pg_embedding
                               (collection_id, document, cmetadata, custom_id)
                           VALUES (%s, %s, %s, %s)
                           """, (
                               collection_id,
                               combined_text,
                               json.dumps(metadata),
                               f'faq_{i + 1}'
                           ))

            if (i + 1) % 10 == 0:
                print(f"{i + 1} kayıt eklendi...")

        # Değişiklikleri kaydet
        conn.commit()
        print(f"Toplam {len(json_data)} kayıt başarıyla eklendi!")

    except Exception as e:
        print(f"Hata oluştu: {e}")
        if conn:
            conn.rollback()
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def create_embeddings_with_ollama(ollama_url="http://localhost:11434", model_name="nomic-embed-text"):
    """Ollama ile embeddings oluştur ve veritabanını güncelle"""
    import requests

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # Embedding'i olmayan kayıtları al
        cursor.execute("""
                       SELECT id, document
                       FROM langchain_pg_embedding
                       WHERE embedding IS NULL
                       """)

        records = cursor.fetchall()
        print(f"{len(records)} kayıt için Ollama ile embedding oluşturuluyor...")

        for record_id, document in records:
            try:
                # Ollama API'sine istek gönder
                response = requests.post(
                    f"{ollama_url}/api/embeddings",
                    json={
                        "model": model_name,
                        "prompt": document
                    },
                    timeout=30
                )

                if response.status_code == 200:
                    embedding_data = response.json()
                    embedding = embedding_data.get('embedding', [])

                    if embedding:
                        # Embedding'i veritabanına kaydet
                        cursor.execute("""
                                       UPDATE langchain_pg_embedding
                                       SET embedding = %s
                                       WHERE id = %s
                                       """, (embedding, record_id))

                        print(f"Embedding oluşturuldu: {record_id}")
                    else:
                        print(f"Boş embedding döndü: {record_id}")
                else:
                    print(f"Ollama API hatası {record_id}: {response.status_code} - {response.text}")

            except requests.exceptions.RequestException as e:
                print(f"Ollama bağlantı hatası {record_id}: {e}")
                continue
            except Exception as e:
                print(f"Embedding oluşturma hatası {record_id}: {e}")
                continue

        conn.commit()
        print("Tüm embeddings başarıyla oluşturuldu!")

    except Exception as e:
        print(f"Hata oluştu: {e}")
        if conn:
            conn.rollback()
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def check_ollama_models():
    """Ollama'da mevcut modelleri kontrol et"""
    import requests

    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=10)
        if response.status_code == 200:
            models = response.json()
            print("Ollama'da mevcut modeller:")
            for model in models.get('models', []):
                print(f"- {model['name']}")
            return [model['name'] for model in models.get('models', [])]
        else:
            print(f"Ollama API'sine erişim hatası: {response.status_code}")
            return []
    except requests.exceptions.RequestException as e:
        print(f"Ollama bağlantı hatası: {e}")
        print("Ollama'nın çalıştığından emin olun: ollama serve")
        return []


def pull_embedding_model(model_name="nomic-embed-text"):
    """Embedding modeli yoksa Ollama'ya indir"""
    import requests

    try:
        print(f"Model indiriliyor: {model_name}")
        response = requests.post(
            "http://localhost:11434/api/pull",
            json={"name": model_name},
            timeout=300  # 5 dakika timeout
        )

        if response.status_code == 200:
            print(f"Model başarıyla indirildi: {model_name}")
            return True
        else:
            print(f"Model indirme hatası: {response.status_code} - {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"Model indirme bağlantı hatası: {e}")
        return False


def update_vector_dimension():
    """Ollama embedding boyutlarına göre veritabanını güncelle"""
    import requests

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # Önce bir test embedding oluştur boyutu öğrenmek için
        test_response = requests.post(
            "http://localhost:11434/api/embeddings",
            json={
                "model": "nomic-embed-text",
                "prompt": "test"
            },
            timeout=30
        )

        if test_response.status_code == 200:
            test_embedding = test_response.json().get('embedding', [])
            embedding_dim = len(test_embedding)
            print(f"Ollama embedding boyutu: {embedding_dim}")

            # Eğer boyut farklıysa tabloyu güncelle
            if embedding_dim != 1536:  # OpenAI default boyutu
                print(f"Vector boyutu {embedding_dim} olarak güncelleniyor...")

                # Yeni tablo oluştur
                cursor.execute(f"""
                    CREATE TABLE IF NOT EXISTS langchain_pg_embedding_new (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        collection_id UUID REFERENCES langchain_pg_collection(uuid) ON DELETE CASCADE,
                        embedding VECTOR({embedding_dim}),
                        document TEXT,
                        cmetadata JSON,
                        custom_id VARCHAR(255)
                    )
                """)

                # Mevcut verileri kopyala (embedding hariç)
                cursor.execute("""
                               INSERT INTO langchain_pg_embedding_new (id, collection_id, document, cmetadata, custom_id)
                               SELECT id, collection_id, document, cmetadata, custom_id
                               FROM langchain_pg_embedding
                               """)

                # Eski tabloyu sil ve yenisini rename et
                cursor.execute("DROP TABLE langchain_pg_embedding")
                cursor.execute("ALTER TABLE langchain_pg_embedding_new RENAME TO langchain_pg_embedding")

                # Index'leri yeniden oluştur
                cursor.execute("CREATE INDEX idx_embedding_collection_id ON langchain_pg_embedding(collection_id)")
                cursor.execute(
                    f"CREATE INDEX idx_embedding_vector ON langchain_pg_embedding USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)")

                conn.commit()
                print("Vector boyutu güncellendi!")

    except Exception as e:
        print(f"Vector boyutu güncelleme hatası: {e}")
        if conn:
            conn.rollback()
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def main():
    """Ana fonksiyon"""
    # JSON dosyasını yükle ve veritabanına ekle
    json_file_path = "paste.txt"  # JSON dosyanızın yolu

    print("JSON dosyası yükleniyor...")
    json_data = load_json_data(json_file_path)

    print("Veriler veritabanına ekleniyor...")
    insert_documents_to_db(json_data)

    # Vector boyutunu Ollama'ya göre güncelle
    print("\nVector boyutu kontrol ediliyor...")
    update_vector_dimension()

    # Ollama modellerini kontrol et
    print("\nOllama modelleri kontrol ediliyor...")
    available_models = check_ollama_models()

    # Embedding modeli var mı kontrol et
    embedding_model = "nomic-embed-text"
    if embedding_model not in available_models:
        print(f"\n{embedding_model} modeli bulunamadı. İndiriliyor...")
        if pull_embedding_model(embedding_model):
            print("Model indirme tamamlandı. Embeddings oluşturuluyor...")
            create_embeddings_with_ollama(model_name=embedding_model)
        else:
            print("Model indirilemedi. Alternatif model deneyin:")
            print("- all-minilm")
            print("- sentence-transformers")
    else:
        print(f"\n{embedding_model} modeli mevcut. Embeddings oluşturuluyor...")
        create_embeddings_with_ollama(model_name=embedding_model)


if __name__ == "__main__":
    main()