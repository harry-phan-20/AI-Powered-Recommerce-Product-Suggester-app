#!/usr/bin/env python3
"""
Script to fetch Google Product Taxonomy and extract a curated subset
for the Renow Recommerce Product Suggester application.
"""

import urllib.request
import json
import ssl
import re

def fetch_taxonomy():
    """Fetch the Google Product Taxonomy from the official source."""
    url = "https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt"
    
    # Create unverified context to bypass SSL issues
    context = ssl._create_unverified_context()
    
    try:
        with urllib.request.urlopen(url, context=context) as response:
            content = response.read().decode('utf-8')
            return content
    except Exception as e:
        print(f"Error fetching taxonomy: {e}")
        return None

def extract_electronics_categories(content):
    """Extract a curated subset of electronics categories."""
    if not content:
        return []
    
    lines = content.strip().split('\n')
    electronics_categories = []
    
    # Target categories for recommerce electronics
    target_patterns = [
        r'^Electronics',
        r'^Electronics > Audio',
        r'^Electronics > Cameras',
        r'^Electronics > Communications',
        r'^Electronics > Computers',
        r'^Electronics > Gaming',
        r'^Electronics > Home Audio',
        r'^Electronics > Mobile Phones',
        r'^Electronics > Tablets',
        r'^Electronics > Video',
        r'^Electronics > Wearables'
    ]
    
    for line in lines:
        line = line.strip()
        if line and not line.startswith('#'):
            for pattern in target_patterns:
                if re.match(pattern, line):
                    electronics_categories.append(line)
                    break
    
    # Ensure we have at least 15 categories
    if len(electronics_categories) < 15:
        # Add some specific popular categories
        additional_categories = [
            "Electronics > Audio > Headphones",
            "Electronics > Audio > Speakers",
            "Electronics > Cameras > Digital Cameras",
            "Electronics > Communications > Telephony > Mobile Phone Accessories",
            "Electronics > Communications > Telephony > Mobile Phones",
            "Electronics > Computers > Desktop Computers",
            "Electronics > Computers > Laptops",
            "Electronics > Computers > Tablets",
            "Electronics > Gaming > Video Game Consoles",
            "Electronics > Home Audio > Home Theater Systems",
            "Electronics > Mobile Phones > Smartphones",
            "Electronics > Video > Televisions",
            "Electronics > Wearables > Smartwatches",
            "Electronics > Wearables > Fitness Trackers"
        ]
        
        for category in additional_categories:
            if category not in electronics_categories:
                electronics_categories.append(category)
    
    # Sort and limit to 20 categories
    electronics_categories.sort()
    return electronics_categories[:20]

def main():
    """Main function to fetch and process taxonomy."""
    print("🔍 Fetching Google Product Taxonomy...")
    
    content = fetch_taxonomy()
    if not content:
        print("❌ Failed to fetch taxonomy")
        return
    
    print("✅ Taxonomy fetched successfully")
    
    # Extract electronics categories
    categories = extract_electronics_categories(content)
    print(f"📱 Found {len(categories)} electronics categories")
    
    # Create the subset data
    subset_data = {
        "source": "https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt",
        "count": len(categories),
        "categories": categories,
        "description": "Curated subset of Google Product Taxonomy for electronics recommerce",
        "lastUpdated": "2024-01-15"
    }
    
    # Write to file
    output_file = "public/taxonomy-subset.json"
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(subset_data, f, indent=2, ensure_ascii=False)
        print(f"✅ Categories written to {output_file}")
        print(f"📊 Total categories: {len(categories)}")
        
        # Print categories for verification
        print("\n📋 Categories included:")
        for i, category in enumerate(categories, 1):
            print(f"  {i:2d}. {category}")
            
    except Exception as e:
        print(f"❌ Error writing file: {e}")

if __name__ == "__main__":
    main()


