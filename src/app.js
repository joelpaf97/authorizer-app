// app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());  
app.use(express.json());
app.use(express.static(path.join(__dirname, 'Public')));


let account = null; // Almacena la información de la cuenta bancaria.
let transactions = []; // Almacena ñas transacciones


// Function para detectar transacciones Frecuentes
function checkFrequency(transaction) {
   
    const transactionTime = new Date(transaction.time);
    const twoMinutesAgo = new Date(transactionTime.getTime() - 2 * 60 * 1000);  

    // Filtrar transacciones dentro de los últimos 2 minutos
    const recentTransactions = transactions.filter(t => {
        const pastTransactionTime = new Date(t.time);
        return pastTransactionTime > twoMinutesAgo && pastTransactionTime <= transactionTime;
    });
    
    recentTransactions.forEach(t => {
       
    });

    return recentTransactions.length >= 3;  
}

// Function para detectar transacciones duplicadas
function checkDoubledTransaction(merchant, amount, time) {
    const transactionTime = new Date(time);
    const twoMinutesAgo = new Date(transactionTime.getTime() - 2 * 60 * 1000); // Dos minutos antes

    return transactions.some(t => {
        const pastTransactionTime = new Date(t.time);
        return t.merchant === merchant &&
               t.amount === amount &&
               pastTransactionTime > twoMinutesAgo &&
               pastTransactionTime <= transactionTime;
    });
}


// Endpoint para crear cuenta
app.post('/create-account', (req, res) => {
   
    if (account) {
       
        return res.status(400).json({ violations: ["account-already-initialized"] });
    }

    const { activeCard, availableLimit } = req.body;

    if (activeCard && availableLimit ) {
        account = { activeCard, availableLimit };
        return res.status(201).json({ account, violations: [] });
    } else if (activeCard == false) {
        account = { activeCard, availableLimit };
        return res.status(201).json({ account, violations: [] });
    }
});




// Endpoint para procesar transacciones
app.post('/transaction', (req, res) => {

    if (!account) {
        return res.status(404).json({ violations: ["account-not-initialized"] });
    }

    const { merchant, amount, time } = req.body.transaction;
    const transactionAmount = Number(amount);
    const transactionTime = new Date(time);
    let violations = [];  


    // Comprobación de tarjeta activa
    if (!account.activeCard) {
        
        violations.push("card-not-active");
    }

    // Comprobación de transacción duplicada
    if (checkDoubledTransaction(merchant, transactionAmount, time)) {
       
        violations.push("doubled-transaction");
    }

    // Comprobación de alta frecuencia de transacciones
    if (checkFrequency({ merchant, amount: transactionAmount, time: transactionTime.toISOString() })) {
       
        violations.push("high-frequency-small-interval");
    }

    // Comprobación de límite insuficiente
    if (transactionAmount > account.availableLimit) {
       
        violations.push("insufficient-limit");
    }

    // Procesar la transacción si no hay violaciones
    if (violations.length === 0) {

        account.availableLimit -= transactionAmount;
        
        transactions.push({ merchant, amount: transactionAmount, time: transactionTime.toISOString() });

        return res.status(201).json({ account, violations: [] });
    } else {
        // Retornar todas las violaciones 
        return res.status(400).json({ account, violations: [] });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app; 
