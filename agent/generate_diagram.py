#!/usr/bin/env python3
"""
Generate PNG diagram from mermaid file
"""

import mermaid
import os

def generate_mermaid_png():
    """Generate PNG from mermaid diagram"""
    
    # Read the mermaid file
    with open('agent_architecture.mmd', 'r', encoding='utf-8') as f:
        mermaid_content = f.read()
    
    print("📊 Generating mermaid diagram PNG...")
    
    try:
        # Generate PNG using mermaid-py
        output_path = "agent_architecture_diagram.png"
        
        # Create Mermaid object with the diagram content - very high resolution
        diagram = mermaid.Mermaid(mermaid_content, width=3000, height=2000, scale=3.0)
        
        # Generate PNG
        diagram.to_png(output_path)
        
        print(f"✅ Diagram generated successfully: {output_path}")
        
        # Check if file was created
        if os.path.exists(output_path):
            file_size = os.path.getsize(output_path)
            print(f"📁 File size: {file_size} bytes")
            return True
        else:
            print("❌ File was not created")
            return False
            
    except Exception as e:
        print(f"❌ Error generating diagram: {e}")
        return False

if __name__ == "__main__":
    success = generate_mermaid_png()
    if success:
        print("🎉 Mermaid diagram PNG generated successfully!")
    else:
        print("💥 Failed to generate diagram")