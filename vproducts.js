const wpClient = require('./src/utils/wpClient'); // must export axios instance
const Joi = require('joi');
const fs = require('fs');
const path = require('path');

async function main() {
    let newProducts = await vproducts();
    console.log(newProducts);
    
    try {
        const filePath = path.join(__dirname, 'src/demodata/vproducts.json');
        let existingProducts = [];
        
        // 1. Read existing data from the file
        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath, 'utf8');
            if (fileData) {
                existingProducts = JSON.parse(fileData);
            }
        }

        // 2. Append the new products (with a safeguard against duplicates)
        for (const newProduct of newProducts) {
            const existingIndex = existingProducts.findIndex(p => p.id === newProduct.id);
            if (existingIndex !== -1) {
                existingProducts[existingIndex] = newProduct; // Update if it already exists
            } else {
                existingProducts.push(newProduct); // Append if it's new
            }
        }

        // 3. Write the updated array back into vproducts.json
        fs.writeFileSync(filePath, JSON.stringify(existingProducts, null, 2));
        console.log(`Successfully saved ${newProducts.length} products to vproducts.json`);

    } catch (error) {
        console.error(`Failed to fetch or save product with ID ${id}:`, error);
    }
};

async function vproducts() {
    let a = [
        6893,
        6894,
        6895,
        6887,
        6888,
        6889,
        6881,
        6882,
        6883,
        6877,
        6878,
        6879,
        6866,
        6867,
        6868,
        6860,
        6861,
        6862,
        6854,
        6855,
        6856,
        6849,
        6850,
        6848,
        6946,
        6947,
        6948,
        6818,
        6820,
        6819
    ];
    // Using a for...of loop ensures the file reading and writing happens sequentially
    let products = [];
    for (const id of a) {
        // Fetch the product from WooCommerce
        const response = await wpClient.get(`/wc/v3/products/${encodeURIComponent(id)}`);
        const newProduct = response.data;
        products.push(newProduct);
    }
    return products;
};

main();