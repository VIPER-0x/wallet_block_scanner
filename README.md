# wallet_block_scanner
این کد یک صفحه وب ساده است که برای مانیتور کردن موجودی **TRON (TRX)** و **USDT** در یک کیف پول خاص طراحی شده است. این صفحه از **API TronScan** برای دریافت اطلاعات استفاده می کند و به طور خودکار هر 30 ثانیه به‌روزرسانی می‌شود. در ادامه توضیحات هر بخش از کد به زبان فارسی ارائه شده است:

---

### **1. ساختار HTML**
```html
<!DOCTYPE html>  
<html>  
<head>  
    <title>TRON & USDT Balance Monitor</title>  
    <style>...</style>  
</head>  
<body>  
    <h1>TRON & USDT Balance Monitor</h1>  
    <div id="balances"></div>  
    <div id="results"></div>  
    <script>...</script>  
</body>  
</html>
```
- **`<title>`**: عنوان صفحه که در تب مرورگر نمایش داده می‌شود.
- **`<style>`**: شامل استایل‌های CSS برای زیباسازی کارت‌های موجودی و تراکنش‌ها.
- **`<h1>`**: عنوان اصلی صفحه.
- **`<div id="balances">`**: بخشی که موجودی TRX و USDT در آن نمایش داده می‌شود.
- **`<div id="results">`**: بخشی که لیست آخرین تراکنش‌ها در آن نمایش داده می‌شود.
- **`<script>`**: شامل کد JavaScript که منطق اصلی برنامه در آن قرار دارد.

---

### **2. استایل‌های CSS**
```css
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
```
- **`.balance-card`**: استایل برای کارت نمایش موجودی TRX و USDT.
- **`.transaction`**: استایل برای کارت‌های نمایش تراکنش‌ها.

---

### **3. کد JavaScript**
#### **متغیرهای اصلی**
```javascript
const apiKey = '--';  
const walletAddress = '--';  
const usdtContractAddress = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
```
- **`apiKey`**: کلید API برای دسترسی به TronScan (در این کد خالی است).
- **`walletAddress`**: آدرس کیف پول TRON که می‌خواهید موجودی و تراکنش‌های آن را مانیتور کنید.
- **`usdtContractAddress`**: آدرس قرارداد USDT در شبکه TRON.

---

#### **تابع `fetchBalances`**
```javascript
async function fetchBalances(address) {  
    try {  
        const trxResponse = await fetch(`https://apilist.tronscanapi.com/api/account?address=${address}`);  
        const trxData = await trxResponse.json();  
        
        const tokenResponse = await fetch(`https://apilist.tronscanapi.com/api/account/tokens?address=${address}&start=0&limit=20&hidden=0&show=0`);  
        const tokenData = await tokenResponse.json();  
        
        const trxBalance = trxData.balance / 1000000;  
        let usdtBalance = 0;  

        const usdtToken = tokenData.data.find(token =>   
            token.tokenId === usdtContractAddress ||   
            token.tokenAbbr === 'USDT'  
        );  
        
        if (usdtToken) {  
            usdtBalance = usdtToken.balance / 1000000;  
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
```
- این تابع موجودی TRX و USDT را از API دریافت می‌کند.
- موجودی TRX از طریق آدرس کیف پول دریافت می‌شود.
- موجودی USDT با جستجو در لیست توکن‌های کیف پول پیدا می‌شود.
- مقادیر موجودی از واحد **sun** (کوچکترین واحد TRX) به TRX و USDT تبدیل می‌شوند.

---

#### **تابع `fetchTransactions`**
```javascript
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
```
- این تابع آخرین تراکنش‌های کیف پول را از API دریافت می‌کند.
- هر تراکنش شامل اطلاعاتی مانند زمان، آدرس فرستنده، آدرس گیرنده، مقدار و هش تراکنش است.

---

#### **تابع `displayBalances`**
```javascript
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
```
- این تابع موجودی TRX و USDT را در صفحه نمایش می‌دهد.

---

#### **تابع `displayTransactions`**
```javascript
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
