const http = require('http');

const putData = JSON.stringify({
    name: "Expense Approval",
    version: 1,
    isActive: true,
    inputSchema: "{}",
    startStepId: "96d26ec5-ebe8-4c7d-9d29-6cd628a806ab"
});

const putOptions = {
    hostname: 'localhost',
    port: 8080,
    path: '/api/workflows/e577cf0b-1af7-4e60-890e-5a52322875e2',
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': putData.length
    }
};

const req1 = http.request(putOptions, (res1) => {
    let data1 = '';
    res1.on('data', chunk => data1 += chunk);
    res1.on('end', () => {
        console.log("PUT status:", res1.statusCode);
        console.log("PUT response:", data1);

        const postData = JSON.stringify({
            data: { amount: 250, country: "US", department: "Finance", priority: "High" }
        });

        const postOptions = {
            hostname: 'localhost',
            port: 8080,
            path: '/api/workflows/e577cf0b-1af7-4e60-890e-5a52322875e2/execute',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length
            }
        };

        const req2 = http.request(postOptions, (res2) => {
            let data2 = '';
            res2.on('data', chunk => data2 += chunk);
            res2.on('end', () => {
                console.log("POST status:", res2.statusCode);
                console.log("POST response:", JSON.stringify(JSON.parse(data2), null, 2));
            });
        });

        req2.on('error', error => console.error(error));
        req2.write(postData);
        req2.end();
    });
});

req1.on('error', error => console.error(error));
req1.write(putData);
req1.end();
