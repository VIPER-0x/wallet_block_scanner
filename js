<!DOCTYPE html>  
<html>  
<head>  
    <title>TRON & USDT Balance Monitor</title>  
    <style>  
        .balance-card {  
            background: #f5f5f5;  
            padding: 15px;  
            margin: 10px 0;  
            border-radius: 5px;  
            border: 1px solid #ddd;  
        }  
        .transaction {  
            margin: 10px 0;  
            padding: 10px;  
            border: 1px solid #ccc;  
            background: #f9f9f9;  
            border-radius: 5px;  
        }  
    </style>  
</head>  
<body>  
    <h1>TRON & USDT Balance Monitor</h1>  
    <div id="balances"></div>  
    <div id="results"></div>  

    <script>  
        const apiKey = '--';  
        const walletAddress = '--';  
        const usdtContractAddress = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';  

        async function fetchBalances(address) {  
            try {  
                // Fetch TRX balance  
                const trxResponse = await fetch(`https://apilist.tronscanapi.com/api/account?address=${address}`);  
                const trxData = await trxResponse.json();  
                
                // Fetch USDT balance  
                const tokenResponse = await fetch(`https://apilist.tronscanapi.com/api/account/tokens?address=${address}&start=0&limit=20&hidden=0&show=0`);  
                const tokenData = await tokenResponse.json();  
                
                const trxBalance = trxData.balance / 1000000; // Convert from sun to TRX  
                let usdtBalance = 0;  

                // Find USDT in token list  
                const usdtToken = tokenData.data.find(token =>   
                    token.tokenId === usdtContractAddress ||   
                    token.tokenAbbr === 'USDT'  
                );  
                
                if (usdtToken) {  
                    usdtBalance = usdtToken.balance / 1000000; // Convert from smallest unit to USDT  
                }  

                return {  
                    trx: trxBalance,  
                    usdt: usdtBalance  
                };  
            } catch (error) {  
                console.error("Error fetching balances:", error);  
                throw error;  
            }  
        }  

        async function fetchTransactions(walletAddress) {  
            const url = `https://apilist.tronscanapi.com/api/transaction?sort=-timestamp&count=true&limit=20&start=0&address=${walletAddress}`;  

            try {  
                const response = await fetch(url);  
                const data = await response.json();  
                
                if (!data || !data.data) throw new Error("Invalid API response structure");  

                return data.data.map(tx => ({  
                    timestamp: new Date(tx.timestamp).toLocaleString(),  
                    from: tx.ownerAddress,  
                    to: tx.toAddress,  
                    hash: tx.hash,  
                    amount: (tx.amount || 0) / 1000000,  
                    tokenInfo: tx.tokenInfo || null,  
                    contractType: tx.contractType  
                }));  
            } catch (error) {  
                console.error("Error fetching transactions:", error);  
                throw error;  
            }  
        }  

        function displayBalances(balances) {  
            const balancesDiv = document.getElementById('balances');  
            balancesDiv.innerHTML = `  
                <div class="balance-card">  
                    <h2>Current Balances</h2>  
                    <p><strong>TRX Balance:</strong> ${balances.trx.toFixed(6)} TRX</p>  
                    <p><strong>USDT Balance:</strong> ${balances.usdt.toFixed(2)} USDT</p>  
                </div>  
            `;  
        }  

        function displayTransactions(transactions) {  
            const resultsDiv = document.getElementById('results');  
            let html = '<h2>Latest Transactions:</h2>';  
            
            transactions.forEach(tx => {  
                let transactionType = "TRX Transfer";  
                let amount = `${tx.amount.toFixed(6)} TRX`;  
                
                if (tx.tokenInfo) {  
                    transactionType = `${tx.tokenInfo.tokenAbbr} Token Transfer`;  
                    amount = `${(tx.tokenInfo.amount || 0).toFixed(2)} ${tx.tokenInfo.tokenAbbr}`;  
                }  

                html += `  
                    <div class="transaction">  
                        <p><strong>Time:</strong> ${tx.timestamp}</p>  
                        <p><strong>Type:</strong> ${transactionType}</p>  
                        <p><strong>From:</strong> ${tx.from}</p>  
                        <p><strong>To:</strong> ${tx.to}</p>  
                        <p><strong>Amount:</strong> ${amount}</p>  
                        <p><strong>Hash:</strong> ${tx.hash}</p>  
                    </div>  
                `;  
            });  
            
            resultsDiv.innerHTML = html;  
        }  

        async function updateData() {  
            try {  
                const [balances, transactions] = await Promise.all([  
                    fetchBalances(walletAddress),  
                    fetchTransactions(walletAddress)  
                ]);  
                
                displayBalances(balances);  
                displayTransactions(transactions);  
            } catch (error) {  
                document.getElementById('results').innerHTML = `  
                    <p style="color: red">Error: ${error.message}</p>  
                `;  
            }  
        }  

        // Initial load  
        updateData();  

        // Refresh every 30 seconds  
        setInterval(updateData, 30000);  
    </script>  
</body>  
</html>  
