import sequelize from "../config/database.js";
import {
  User,
  Package,
  Bill,
  SupportTicket,
  Campaign,
  UserCampaign,
} from "../models/index.js";

const seedDatabase = async () => {
  try {
    // Clear existing data
    await sequelize.sync({ force: true });
    console.log("📚 Veritabanı temizlendi ve yeniden oluşturuldu");

    // Seed packages
    const packages = await Package.bulkCreate([
      {
        package_id: "PKG001",
        name: "Temel Paket",
        price: 99.99,
        data_limit_gb: 10,
        voice_minutes: 1000,
        sms_count: 100,
        features: { roaming: false, hotspot: true },
        is_active: true,
      },
      {
        package_id: "PKG002",
        name: "Premium Paket",
        price: 199.99,
        data_limit_gb: 50,
        voice_minutes: -1,
        sms_count: -1,
        features: { roaming: true, hotspot: true, international: true },
        is_active: true,
      },
      {
        package_id: "PKG003",
        name: "Aile Paketi",
        price: 299.99,
        data_limit_gb: 100,
        voice_minutes: -1,
        sms_count: -1,
        features: { roaming: true, hotspot: true, family_sharing: true },
        is_active: true,
      },
    ]);
    console.log("📦 Örnek paketler oluşturuldu");

    // Seed users
    const users = await User.bulkCreate([
      {
        customer_id: "MSTR001",
        phone_number: "+905551234567",
        first_name: "Ahmet",
        last_name: "Yılmaz",
        email: "ahmet.yilmaz@email.com",
        tc_kimlik: "12345678901",
        birth_date: "1990-01-01",
        current_package_id: "PKG001",
        payment_status: "paid",
        balance: 0.0,
        data_usage_gb: 5.2,
        voice_usage_minutes: 450,
        address: "Fenerbahçe Mahallesi, Bağdat Caddesi No:123, Kadıköy",
        city: "İstanbul",
      },
      {
        customer_id: "MSTR002",
        phone_number: "+905552345678",
        first_name: "Fatma",
        last_name: "Demir",
        email: "fatma.demir@email.com",
        tc_kimlik: "23456789012",
        birth_date: "1985-05-15",
        current_package_id: "PKG002",
        payment_status: "paid",
        balance: 50.0,
        data_usage_gb: 32.1,
        voice_usage_minutes: 2100,
        address: "Kızılay Mahallesi, Atatürk Bulvarı No:456, Çankaya",
        city: "Ankara",
      },
      {
        customer_id: "MSTR003",
        phone_number: "+905553456789",
        first_name: "Mehmet",
        last_name: "Kaya",
        email: "mehmet.kaya@email.com",
        tc_kimlik: "34567890123",
        birth_date: "1992-12-03",
        current_package_id: "PKG003",
        payment_status: "overdue",
        balance: -150.0,
        data_usage_gb: 78.5,
        voice_usage_minutes: 3200,
        address: "Alsancak Mahallesi, Kordon Caddesi No:789, Konak",
        city: "İzmir",
      },
      {
        customer_id: "MSTR004",
        phone_number: "+905554567890",
        first_name: "Ayşe",
        last_name: "Çelik",
        email: "ayse.celik@email.com",
        tc_kimlik: "45678901234",
        birth_date: "1988-08-20",
        current_package_id: "PKG002",
        payment_status: "paid",
        balance: 25.0,
        data_usage_gb: 18.7,
        voice_usage_minutes: 1800,
        address: "Lara Mahallesi, Antalya Yolu No:321, Muratpaşa",
        city: "Antalya",
      },
      {
        customer_id: "MSTR005",
        phone_number: "+905555678901",
        first_name: "Emre",
        last_name: "Özkan",
        email: "emre.ozkan@email.com",
        tc_kimlik: "56789012345",
        birth_date: "1995-03-12",
        current_package_id: "PKG001",
        payment_status: "paid",
        balance: 15.0,
        data_usage_gb: 7.8,
        voice_usage_minutes: 650,
        address: "Nilüfer Mahallesi, Uludağ Caddesi No:654, Nilüfer",
        city: "Bursa",
      },
    ]);
    console.log("👤 Örnek kullanıcılar oluşturuldu");

    // Seed bills
    const bills = await Bill.bulkCreate([
      {
        bill_id: "FTRA001",
        user_id: users[0].id,
        billing_period_start: "2024-07-01",
        billing_period_end: "2024-07-31",
        due_date: "2024-08-15",
        total_amount: 99.99,
        payment_status: "paid",
        payment_date: "2024-08-10",
        data_used_gb: 8.5,
        voice_used_minutes: 890,
      },
      {
        bill_id: "FTRA002",
        user_id: users[1].id,
        billing_period_start: "2024-07-01",
        billing_period_end: "2024-07-31",
        due_date: "2024-08-15",
        total_amount: 199.99,
        payment_status: "paid",
        payment_date: "2024-08-12",
        data_used_gb: 45.2,
        voice_used_minutes: 2500,
      },
      {
        bill_id: "FTRA003",
        user_id: users[2].id,
        billing_period_start: "2024-07-01",
        billing_period_end: "2024-07-31",
        due_date: "2024-08-15",
        total_amount: 299.99,
        payment_status: "overdue",
        data_used_gb: 95.1,
        voice_used_minutes: 4200,
      },
      {
        bill_id: "FTRA004",
        user_id: users[3].id,
        billing_period_start: "2024-07-01",
        billing_period_end: "2024-07-31",
        due_date: "2024-08-15",
        total_amount: 199.99,
        payment_status: "paid",
        payment_date: "2024-08-05",
        data_used_gb: 35.8,
        voice_used_minutes: 1750,
      },
      {
        bill_id: "FTRA005",
        user_id: users[4].id,
        billing_period_start: "2024-07-01",
        billing_period_end: "2024-07-31",
        due_date: "2024-08-15",
        total_amount: 99.99,
        payment_status: "paid",
        payment_date: "2024-08-08",
        data_used_gb: 6.2,
        voice_used_minutes: 580,
      },
    ]);
    console.log("💰 Örnek faturalar oluşturuldu");

    // Seed support tickets
    const tickets = await SupportTicket.bulkCreate([
      {
        ticket_id: "DLK001",
        user_id: users[0].id,
        issue_type: "baglanti",
        priority: "yuksek",
        status: "acik",
        title: "İnternet bağlantısı yavaş",
        description:
          "Son 3 gündür internet bağlantım çok yavaş. Hız testi 50 Mbps yerine sadece 5 Mbps gösteriyor. Lütfen bu sorunu çözebilir misiniz?",
      },
      {
        ticket_id: "DLK002",
        user_id: users[1].id,
        issue_type: "faturalama",
        priority: "orta",
        status: "devam_ediyor",
        title: "Fatura tutarında hata var",
        description:
          "Bu ay yapmadığım uluslararası aramalar için ekstra ücret kesilmiş. Lütfen kontrol edip düzeltme yapabilir misiniz?",
      },
      {
        ticket_id: "DLK003",
        user_id: users[2].id,
        issue_type: "hesap",
        priority: "dusuk",
        status: "cozuldu",
        title: "Şifre sıfırlama talebi",
        description: "Hesap şifremi unuttum ve sıfırlamam gerekiyor.",
        resolution:
          "Şifre sıfırlama linki kayıtlı e-posta adresinize gönderildi.",
        resolved_at: new Date(),
      },
      {
        ticket_id: "DLK004",
        user_id: users[3].id,
        issue_type: "teknik",
        priority: "yuksek",
        status: "acik",
        title: "Mobil veri çekmiyor",
        description:
          "Antalya'da belirli bölgelerde mobil veri hiç çekmiyor. Wi-Fi olmadığında internete erişemiyorum.",
      },
      {
        ticket_id: "DLK005",
        user_id: users[4].id,
        issue_type: "paket",
        priority: "orta",
        status: "devam_ediyor",
        title: "Paket değişikliği talebi",
        description:
          "Mevcut paketim ihtiyaçlarımı karşılamıyor. Daha uygun bir pakete geçmek istiyorum.",
      },
      {
        ticket_id: "DLK006",
        user_id: users[0].id,
        issue_type: "faturalama",
        priority: "dusuk",
        status: "cozuldu",
        title: "Otomatik ödeme kurulumu",
        description: "Faturalarım için otomatik ödeme kurmak istiyorum.",
        resolution:
          "Otomatik ödeme talimatı başarıyla kuruldu. Gelecek faturalar otomatik olarak ödenecek.",
        resolved_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
    ]);
    console.log("🎫 Örnek destek talepleri oluşturuldu");

    // Seed campaigns
    const campaigns = await Campaign.bulkCreate([
      {
        campaign_id: "CAMP001",
        name: "Yaz Kampanyası 2025",
        description:
          "Yaz aylarında tüm kullanıcılarımıza özel %20 indirim kampanyası",
        campaign_type: "discount",
        target_audience: "all",
        discount_percentage: 20,
        discount_amount: 0,
        free_data_gb: 5,
        free_voice_minutes: 100,
        applicable_packages: ["PKG001", "PKG002", "PKG003"],
        start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Started 7 days ago
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Ends in 30 days
        is_active: true,
        max_uses: 100,
        current_uses: 0,
        terms_conditions:
          "Kampanya sadece aktif hat sahipleri için geçerlidir. Diğer kampanyalarla birleştirilemez.",
      },
      {
        campaign_id: "CAMP002",
        name: "Premium Kullanıcılar İçin Özel",
        description:
          "Premium paket kullanıcılarına özel 50 TL indirim ve 10GB bonus internet",
        campaign_type: "loyalty",
        target_audience: "premium_users",
        discount_percentage: 0,
        discount_amount: 50,
        free_data_gb: 10,
        free_voice_minutes: 0,
        applicable_packages: ["PKG002", "PKG003"],
        start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Started 3 days ago
        end_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // Ends in 45 days
        is_active: true,
        max_uses: 50,
        current_uses: 0,
        terms_conditions:
          "Sadece Premium ve Aile Paketi kullanıcıları için geçerlidir.",
      },
      {
        campaign_id: "CAMP003",
        name: "Yeni Kullanıcı Karşılama",
        description:
          "Yeni müşterilerimize hoş geldin bonusu: İlk ay %50 indirim",
        campaign_type: "promotion",
        target_audience: "new_users",
        discount_percentage: 50,
        discount_amount: 0,
        free_data_gb: 15,
        free_voice_minutes: 500,
        applicable_packages: ["PKG001", "PKG002"],
        start_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // Started 14 days ago
        end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // Ends in 60 days
        is_active: true,
        max_uses: 200,
        current_uses: 0,
        terms_conditions:
          "Sadece son 30 gün içinde kayıt olan kullanıcılar için geçerlidir.",
      },
      {
        campaign_id: "CAMP004",
        name: "Borç Tahsil Kampanyası",
        description: "Geciken ödemeler için ek süre ve %10 indirim",
        campaign_type: "promotion",
        target_audience: "overdue_users",
        discount_percentage: 10,
        discount_amount: 0,
        free_data_gb: 0,
        free_voice_minutes: 0,
        applicable_packages: ["PKG001", "PKG002", "PKG003"],
        start_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Started 5 days ago
        end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Ends in 15 days
        is_active: true,
        max_uses: 30,
        current_uses: 0,
        terms_conditions:
          "Sadece ödeme gecikme durumu olan müşteriler için geçerlidir.",
      },
      {
        campaign_id: "CAMP005",
        name: "Arkadaş Tavsiye Bonusu",
        description:
          "Arkadaşını getir, ikiniz de kazanın! 25 TL bonus ve 5GB internet",
        campaign_type: "referral",
        target_audience: "all",
        discount_percentage: 0,
        discount_amount: 25,
        free_data_gb: 5,
        free_voice_minutes: 200,
        applicable_packages: ["PKG001", "PKG002", "PKG003"],
        start_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Started 10 days ago
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Ends in 90 days
        is_active: true,
        max_uses: 500,
        current_uses: 0,
        terms_conditions: "Tavsiye edilen kişi en az 3 ay müşteri kalmalıdır.",
      },
    ]);
    console.log("🎯 Örnek kampanyalar oluşturuldu");

    // Apply some campaigns to users for demonstration
    const userCampaigns = await UserCampaign.bulkCreate([
      {
        user_id: users[0].id, // Ahmet
        campaign_id: campaigns[0].id, // Yaz Kampanyası
        discount_applied: users[0].package?.price * 0.2 || 20,
        data_bonus_gb: 5,
        voice_bonus_minutes: 100,
        expires_at: campaigns[0].end_date,
        status: "active",
        notes: "Yaz kampanyası otomatik olarak uygulandı",
      },
      {
        user_id: users[1].id, // Fatma
        campaign_id: campaigns[1].id, // Premium Kullanıcılar
        discount_applied: 50,
        data_bonus_gb: 10,
        voice_bonus_minutes: 0,
        expires_at: campaigns[1].end_date,
        status: "active",
        notes: "Premium kullanıcı kampanyası manuel olarak uygulandı",
      },
      {
        user_id: users[4].id, // Emre
        campaign_id: campaigns[2].id, // Yeni Kullanıcı
        discount_applied: users[4].package?.price * 0.5 || 50,
        data_bonus_gb: 15,
        voice_bonus_minutes: 500,
        expires_at: campaigns[2].end_date,
        status: "active",
        notes: "Yeni kullanıcı hoş geldin bonusu",
      },
    ]);
    console.log("👥 Örnek kullanıcı kampanyaları uygulandı");

    // Update campaign usage counters
    await campaigns[0].update({ current_uses: 1 });
    await campaigns[1].update({ current_uses: 1 });
    await campaigns[2].update({ current_uses: 1 });

    console.log("✅ Veritabanı başarıyla dolduruldu!");
  } catch (error) {
    console.error("❌ Veritabanı doldurma hatası:", error);
  }
};

export default seedDatabase;
