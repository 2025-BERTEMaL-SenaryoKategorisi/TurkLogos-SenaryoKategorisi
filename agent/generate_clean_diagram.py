#!/usr/bin/env python3
"""
Generate clean PNG diagram from mermaid file
"""

import mermaid
import os

def generate_clean_mermaid_png():
    """Generate PNG from clean mermaid diagram"""
    
    # Read the clean mermaid file
    with open('agent_architecture_clean.mmd', 'r', encoding='utf-8') as f:
        mermaid_content = f.read()
    
    print("📊 Generating clean mermaid diagram PNG...")
    
    try:
        # Generate PNG using mermaid-py with high resolution
        output_path = "agent_architecture.png"
        
        # Create Mermaid object with the diagram content - high resolution
        diagram = mermaid.Mermaid(mermaid_content, width=2000, height=1400, scale=2.5)
        
        # Generate PNG
        diagram.to_png(output_path)
        
        print(f"✅ Clean diagram generated successfully: {output_path}")
        
        # Check if file was created
        if os.path.exists(output_path):
            file_size = os.path.getsize(output_path)
            print(f"📁 File size: {file_size} bytes ({file_size/1024:.1f} KB)")
            return True
        else:
            print("❌ File was not created")
            return False
            
    except Exception as e:
        print(f"❌ Error generating diagram: {e}")
        return False

if __name__ == "__main__":
    success = generate_clean_mermaid_png()
    if success:
        print("🎉 Clean mermaid diagram PNG generated successfully!")
    else:
        print("💥 Failed to generate diagram")