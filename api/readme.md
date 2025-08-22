# Product Scraper and Image Search

This Python script [`scraper.py`] performs key tasks related to fetching and processing product data from Myntra:

1.  **Web Scraping:** It scrapes product details (metadata, image URLs, etc.) from specific Myntra API endpoints defined in `URLS_LIST`. It handles pagination and uses request headers to mimic a browser.

2.  **Data Storage (MongoDB):**

    - It connects to a MongoDB database specified by `MONGODB_URI`.
    - It checks for existing product IDs and only inserts _new_ products into the specified collection (`collection1` in `mainDB`) to avoid duplicates.

3.  **Image Embedding (CLIP & PyTorch):**

    - It loads the OpenAI CLIP model (`clip-vit-base-patch16`).
    - It fetches product image URLs from the MongoDB database.
    - It downloads images, converts them into vector embeddings using the CLIP model. For products with multiple specified images (e.g., front/back), it calculates an average embedding.

4.  **Vector Storage (Pinecone):**
    - It connects to a Pinecone vector database index (`prodindex`) using the `PINECONE_API` key.
    - It upserts (inserts or updates) the generated image embeddings along with product metadata (ID, name, brand) into the Pinecone index.
5.  **Similarity Search:**
    - It provides a function (`search_similar_images`) that takes a query image (either via URL or base64 string), generates its embedding using CLIP, and queries the Pinecone index to find and return the most visually similar products based on their embeddings.

**Dependencies:**

- `requests`
- `pymongo`
- `pinecone-client`
- `torch`
- `transformers`
- `Pillow` (PIL)
- `python-dotenv`
- `beautifulsoup4`

**Setup:**

- Requires a `.env` file in the same directory containing `MONGODB_URI` and `PINECONE_API` environment variables.
- Assumes MongoDB and Pinecone instances/indexes are already set up as per the configuration.

**Usage:**

The script defines functions for each major step. The `if __name__ == "__main__":` block contains commented-out examples of how to run the scraping (`scrape_products`), embedding (`processImgToPinecone`), and search (`search_similar_images`) functionalities.
