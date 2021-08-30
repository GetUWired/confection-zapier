//loop through page count, fetching each page of results and adding to outputObject
async function pagination(z, bundle, pages, page_1, url) {
    var outputObject = page_1;

    for (counter = 2; counter <= pages; counter++) {
        var request = await fetch(`${url}/page/${counter}`, {
            method: "POST",
            headers: {
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                'key': bundle.authData.secret_key
            })
        }); //end of request
        var data = await request.json();

        outputObject = Object.assign(outputObject, data.collection)

    }

    return outputObject;
} //end of pagination function

const cursor = async (z, bundle, timestamp) => {
    var cursor;
    cursor = await z.cursor.get();

    await z.cursor.set(`${timestamp}`);


    return cursor;
}

module.exports = {
    pagination,
    cursor
}