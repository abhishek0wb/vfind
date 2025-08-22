import torch
from PIL import Image
import requests
from io import BytesIO
from transformers import CLIPProcessor, CLIPModel
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from bs4 import BeautifulSoup
import logging
import time
from pinecone import Pinecone
from io import BytesIO
import base64
import os
from dotenv import load_dotenv

load_dotenv()

# pinecone string
pc = Pinecone(api_key=os.getenv("PINECONE_API"))
pinecone_index = pc.Index("prodindex")
print(pinecone_index.describe_index_stats())


# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


# MongoDB connection details
DATABASE_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = "mainDB"
COLLECTION_NAME = "collection1"

# init MongoDB client
mongo_client = MongoClient(DATABASE_URI, server_api=ServerApi("1"))
db = mongo_client[DATABASE_NAME]
collection = db[COLLECTION_NAME]
print(collection.name)


# Myntra URL and User Agent
MYNTRA_URL = "https://www.myntra.com"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"

# Scraping parameters
PINCODE = "562130"
ROWS_PER_PAGE = 50
PRICE_BUCKETS = 20
BATCH_SIZE = 1000

# Headers
HEADERS = {
    "authority": "www.myntra.com",
    "method": "GET",
    "scheme": "https",
    "accept": "*/*",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
    "cache-control": "no-cache",
    "pragma": "no-cache",
    "priority": "u=1, i",
    "sec-ch-ua": '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133")',
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": '"Android"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36",
    "x-device-state": "model=Nexus 5;brand=OnePlus",
    "x-location-context": f"pincode={PINCODE};source=IP",
    "x-meta-app": "appFamily=MyntraRetailMweb;",
    "x-myntra-abtest": "config.bucket=regular;coupon.cart.channelAware=channelAware_Enabled",
    "x-myntra-app": "deviceID=c81c9d3e-d0f1-4bb5-8ba1-71778d53c1ba;reqChannel=web;appFamily=MyntraRetailMweb;",
    "x-myntraweb": "Yes",
    "x-sed-with": "browser",
    "cookie": "",  # Initial cookie value, will be updated
}

# URLs list
URLS_LIST = [
    # men's
    "https://www.myntra.com/gateway/v2/search/men-topwear?o=0&ifo=0&ifc=0&pincode=562130&rows=50&priceBuckets=20",
    "https://www.myntra.com/gateway/v2/search/men-ethnic-wear?o=0&ifo=0&ifc=0&pincode=562130&rows=50&priceBuckets=20",
    "https://www.myntra.com/gateway/v2/search/men-bottomwear?o=0&ifo=0&ifc=0&pincode=562130&rows=50&priceBuckets=20",
    "https://www.myntra.com/gateway/v2/search/men-innerwear?o=0&ifo=0&ifc=0&pincode=562130&rows=50&priceBuckets=20",
    "https://www.myntra.com/gateway/v2/search/men-footwear?o=0&ifo=0&ifc=0&pincode=562130&rows=50&priceBuckets=20",
    "https://www.myntra.com/gateway/v2/search/men-personal-care?o=0&ifo=0&ifc=0&pincode=562130&rows=50&priceBuckets=20",
    "https://www.myntra.com/gateway/v2/search/men-sunglasses?o=0&ifo=0&ifc=0&pincode=562130&rows=50&priceBuckets=20",
    "https://www.myntra.com/gateway/v2/search/mens-watches?o=0&ifo=0&ifc=0&pincode=562130&rows=50&priceBuckets=20",
    "https://www.myntra.com/gateway/v2/search/men-sports-wear?o=0&ifo=0&ifc=0&pincode=562130&rows=50&priceBuckets=20",
    "https://www.myntra.com/gateway/v2/search/gadgets?o=0&ifo=0&ifc=0&pincode=562130&rows=50&priceBuckets=20",
    "https://www.myntra.com/gateway/v2/search/men-accessories?o=0&ifo=0&ifc=0&pincode=562130&rows=50&priceBuckets=20",
    "https://www.myntra.com/gateway/v2/search/men-bags-backpacks?o=0&ifo=0&ifc=0&pincode=562130&rows=50&priceBuckets=20",
    "https://www.myntra.com/gateway/v2/search/trolley-bags?o=0&ifo=0&ifc=0&pincode=562130&rows=50&priceBuckets=20",
    # women's
    "https://www.myntra.com/gateway/v2/search/fusion-wear?o=0&ifo=0&ifc=0&pincode=562130&rows=50&priceBuckets=20",
    "https://www.myntra.com/gateway/v2/search/women-accessories?o=0&ifo=0&ifc=0&pincode=562130&rows=50&priceBuckets=20",
    "https://www.myntra.com/gateway/v2/search/women-watches?o=0&ifo=0&ifc=0&pincode=562130&rows=50&priceBuckets=20",
    "https://www.myntra.com/gateway/v2/search/womens-western-wear?o=0&ifo=0&ifc=0&pincode=562130&rows=50&priceBuckets=20",
    "https://www.myntra.com/gateway/v2/search/myntra-fashion-store?o=0&ifo=0&ifc=0&pincode=562130&rows=50&requestType=ANY&f=Categories%3ACamisoles%2CChuridar%2CDresses%2CHarem+Pants%2CJeans%2CKurta+Sets%2CKurtas%2CKurtis%2CLeggings%2CLounge+Tshirts%2CNightdress%2CPalazzos%2CShirts%2CShrug%2CSkirts%2CTops%2CTrack+Pants%2CTrousers%2CTshirts%2CTunics%3A%3AGender%3Amen+women%2Cwomen%3A%3AOccasion%3AMaternity&priceBuckets=20",
    "https://www.myntra.com/gateway/v2/search/women-sunglasses?o=0&ifo=0&ifc=0&pincode=562130&rows=50&priceBuckets=20",
    "https://www.myntra.com/gateway/v2/search/women-footwear?o=0&ifo=0&ifc=0&pincode=562130&rows=50&priceBuckets=20",
    "https://www.myntra.com/gateway/v2/search/women-sportswear?o=0&ifo=0&ifc=0&pincode=562130&rows=50&priceBuckets=20",
    "https://www.myntra.com/gateway/v2/search/lingerie-and-loungewear1?o=0&ifo=0&ifc=0&pincode=562130&rows=50&priceBuckets=20",
    "https://www.myntra.com/gateway/v2/search/women-personal-care?o=0&ifo=0&ifc=0&pincode=562130&rows=50&priceBuckets=20",
    "https://www.myntra.com/gateway/v2/search/women-jewellery?o=0&ifo=0&ifc=0&pincode=562130&rows=50&priceBuckets=20",
    "https://www.myntra.com/gateway/v2/search/backpacks-for-women?o=0&ifo=0&ifc=0&pincode=562130&rows=50&priceBuckets=20",
    "https://www.myntra.com/gateway/v2/search/handbags-and-bags?o=0&ifo=0&ifc=0&pincode=562130&rows=50&priceBuckets=20",
]


# refreshes cookie by making a request to the myntra homepage
def refresh_cookie() -> str:
    try:
        session = requests.Session()
        session.headers.update({"User-Agent": USER_AGENT})
        response = session.get(MYNTRA_URL, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        cookies = session.cookies.get_dict()
        cookie = cookies.get("at")
        if not cookie:
            raise ValueError("Cookie 'at' not found in the response")
        logging.info("Cookie refreshed successfully")
        return cookie
    except requests.exceptions.RequestException as e:
        logging.error(f"Error refreshing cookie: {e}")
        return None
    except ValueError as e:
        logging.error(f"Error extracting cookie: {e}")
        return None


# total number of products for a given URL
def get_page_count(url: str) -> int:
    session = requests.Session()
    session.headers.update(HEADERS)
    try:
        response = session.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        data = response.json()
        total_products = data.get("totalCount", 0)
        logging.info(f"Total products for {url}: {total_products}")
        return total_products
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching page count for {url}: {e}")
        return 0
    except ValueError:
        logging.error(f"Failed to decode JSON for {url}")
        return 0


# fetches products from a specific page
def fetch_products_from_page(session: requests.Session, url: str, page: int) -> list:
    p_url = url.replace("o=0", f"o={page}")
    try:
        response = session.get(p_url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        data = response.json()
        products = data.get("products", [])
        logging.info(f"Fetched {len(products)} products from {p_url}")
        return products
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching products from {p_url}: {e}")
        return []
    except ValueError:
        logging.error(f"Failed to decode JSON from {p_url}")
        return []


# retrieves existing product IDs from the db
def get_existing_product_ids(product_codes: list) -> set:
    existing_products = list(
        collection.find(
            {"productId": {"$in": product_codes}}, {"productId": 1, "_id": 0}
        )
        # collection.find(
        #    {"productId": {"$in": all_products_code}},
        #    {"productId": 1, "_id": 1},
        # )
        # whats the difference between the two lines above?
    )
    return {item["productId"] for item in existing_products}


# insert new products into the db
def insert_new_products(new_products: list):
    if new_products:
        try:
            collection.insert_many(new_products, ordered=False)
            logging.info(f"Inserted {len(new_products)} new products into the database")
        except Exception as e:
            if e.code == 8000:
                logging.error("db quota exceeded!!")
                logging.error("<----scraper stopped---->")
                raise RuntimeError("MongoDB quota exceeded - stopping scraper") from e
            else:
                logging.error(f"Error inserting products into the database: {e}")
    else:
        logging.info("No new products to insert")


# scrape products
def scrape_products():
    start_time = time.time()
    session = requests.Session()
    HEADERS["cookie"] = f"at={refresh_cookie()}"
    session.headers.update(HEADERS)
    all_products_code = []
    all_products = []  # Accumulate full product details
    total_new_products = []

    try:
        for url in URLS_LIST:
            logging.info(f"Processing URL: {url}")
            total_pages = get_page_count(url)
            if total_pages == 0:
                logging.warning(f"No pages found for URL: {url}")
                continue

            for page in range(0, total_pages + 1, ROWS_PER_PAGE - 1):
                products = fetch_products_from_page(session, url, page)

                logging.info(f"this page {page} have {len(products)} products")
                if not products:
                    continue

                product_codes = [product["productId"] for product in products]
                logging.info(f"and these are codes {(product_codes)} ----------->")
                all_products_code.extend(product_codes)
                all_products.extend(products)  # Accumulate full product details
                logging.info(f"all products code length {len(all_products_code)}")

                # Check batch size and process
                if len(all_products_code) >= BATCH_SIZE:
                    logging.info(
                        f"collected {len(all_products_code)} product codes, processing..."
                    )
                    existing_ids = get_existing_product_ids(all_products_code)
                    logging.info(f"existing ids length {len(existing_ids)}")
                    new_ids = set(all_products_code) - existing_ids
                    logging.info(f"new ids {len(new_ids)}")

                    new_page_prods = [
                        itm for itm in all_products if itm["productId"] in new_ids
                    ]
                    logging.info(f"new page products length {len(new_page_prods)}")
                    if new_page_prods:
                        total_new_products.extend(new_page_prods)
                        insert_new_products(new_page_prods)
                    else:
                        logging.info("No new products to insert")
                    all_products_code = []  # Reset the list after processing
                    all_products = []  # Reset the list after processing

        # process any remaining products
        if all_products_code:
            logging.info(
                f"Processing remaining {len(all_products_code)} product codes..."
            )
            existing_ids = get_existing_product_ids(all_products_code)
            new_ids = set(all_products_code) - existing_ids

            new_page_prods = [
                itm for itm in all_products if itm["productId"] in new_ids
            ]
            if new_page_prods:
                total_new_products.extend(new_page_prods)
                insert_new_products(new_page_prods)

    except Exception as e:
        logging.error(f"An unexpected error occurred: {e}", exc_info=True)

    finally:
        end_time = time.time()
        total_time = end_time - start_time
        logging.info(f"Total scraping time: {total_time:.2f} seconds")
        mongo_client.close()
        return total_new_products


## load CLIP -> fetch img from db -> img to vector -> init pinecone -> create index -> process and upload to pinecone -> fxn for similar img


# load CLIP
def loadClip():
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
    processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
    return device, processor, model


device, processor, model = loadClip()


# extract image url from mongodb
def fetchImgLinkFromDB():
    print("Retrieving image links from MongoDB")
    documents = list(
        collection.find(
            {},
            {"productId": 1, "productName": 1, "brand": 1, "images": 1},
        ).limit(10)
    )
    print(f"Total documents fetched: {len(documents)}")
    link_map = []

    print("Extracting image links from documents")
    # extract all images
    for doc in documents:
        selected_images = [
            img["src"]
            for img in doc.get("images", [])
            if img["view"] in ["front", "back"]
        ]
        if selected_images:
            link_map.append(
                {
                    "productId": doc["productId"],
                    "images": selected_images,
                    "productName": doc["productName"],
                    "brand": doc["brand"],
                }
            )

    print(f"Total images fetched: {len(link_map)}")
    print(link_map[0])
    return link_map


# img to vector
# -> download img -> convert to PIL image -> process img for CLIP -> get vector from CLIP
def img_to_vector(img_url, base64_str):
    print(f"Image to vector called for {img_url if img_url else 'base64 image'}")

    try:
        if img_url:
            response = requests.get(img_url, timeout=5)
            response.raise_for_status()
            image = Image.open(BytesIO(response.content)).convert("RGB")
        elif base64_str:
            print("Processing base64 image...")
            image_data = base64.b64decode(
                base64_str.split(",")[1] if "," in base64_str else base64_str
            )
            image = Image.open(BytesIO(image_data)).convert("RGB")

        inputs = processor(images=image, return_tensors="pt").to(device)

        # Generate image embeddings
        with torch.no_grad():
            image_features = model.get_image_features(**inputs)

        return image_features.squeeze().cpu().numpy()

    except Exception as e:
        logging.error(f"Error processing image: {e}")
        return None


# process and upload img to pinecone
def processImgToPinecone():
    link_map = fetchImgLinkFromDB()
    all_vectors = []

    for item in link_map:
        vec_record = {}
        vectors = []
        img_url = item["images"]
        for iurl in img_url:
            img_vector = img_to_vector(iurl)
            if img_vector is not None:
                vectors.append(img_vector)
        if vectors:
            avg_vector = sum(vectors) / len(vectors)
            vec_record["id"] = str(item["productId"])
            vec_record["values"] = avg_vector.tolist()
            vec_record["metadata"] = {
                "productName": item["productName"],
                "brand": item["brand"],
            }
            all_vectors.append(vec_record)
            logging.info(f"Uploaded image vector for {item['productName']} to Pinecone")
        else:
            logging.error(f"Failed to process image vector for {item['productName']}")

    # upload to pinecone
    if all_vectors:
        pinecone_index.upsert(vectors=all_vectors)

    logging.info("All images processed and uploaded to Pinecone")


# search for similar images
def search_similar_images(query_image_url=None, top_k=3, base64=None):

    query_vector = img_to_vector(query_image_url, base64)
    if query_vector is None:
        return []

    results = pinecone_index.query(
        vector=query_vector.tolist(), top_k=top_k, include_metadata=True
    )

    matches = results.get("matches", [])
    get_data_form_matches = [
        {
            "id": match["id"],
            "productName": match["metadata"]["productName"],
            "score": match["score"],
        }
        for match in matches
    ]
    return get_data_form_matches


# search for product via productId in mongodb
def getLinkFromDB(id: str):
    id = int(id)
    print(id)
    link = collection.find_one(
        {"productId": id, "images": {"$exists": True}},
        {"_id": 0, "images": 1},
    )
    link = link["images"][0].get("src")
    print(link)
    return link

    # http://assets.myntassets.com/assets/images/31973469/2024/12/14/07109c69-53d0-40af-84fc-a0965b8639261734176009937HIGHLANDERMenSlimFitOpaqueStripedCasualShirt2.jpg   test image


if __name__ == "__main__":
    # new_products = scrape_products()
    # processImgToPinecone()
    # search_results = search_similar_images(
    #     "http://assets.myntassets.com/assets/images/31973469/2024/12/14/07109c69-53d0-40af-84fc-a0965b8639261734176009937HIGHLANDERMenSlimFitOpaqueStripedCasualShirt2.jpg"
    # )
    print("hello!")
