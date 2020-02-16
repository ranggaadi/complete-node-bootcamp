module.exports = (template, product) => {
    let output = template.replace(/{%ID%}/g, product.id)
    .replace(/{%PRODUCTNAME%}/g, product.productName)
    .replace(/{%IMAGE%}/g, product.image)
    .replace(/{%FROM%}/g, product.from)
    .replace(/{%NUTRIENTS%}/g, product.nutrients)
    .replace(/{%QUANTITY%}/g, product.quantity)
    .replace(/{%PRICE%}/g, product.price)
    .replace(/{%ORGANIC%}/g, `${product.organic ? '' : 'not-organic'}`)
    .replace(/{%DESCRIPTION%}/g, product.description);

    return output;
}