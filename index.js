const express = require('express');
const app = express();
const port = 3000;

app.use(express.json()); // Middleware para parsear JSON en las solicitudes entrantes.

let account = null; // Almacena la información de la cuenta bancaria.
let transactions = []; // Almacena las transacciones recientes para verificar la frecuencia.
let violations = []; // Almacena las violaciones o errores que se produzcan.

// Función auxiliar para verificar transacciones frecuentes en un intervalo corto.
function checkFrequency(transaction) {
    const twoMinutesAgo = new Date(transaction.time);
    twoMinutesAgo.setMinutes(twoMinutesAgo.getMinutes() - 2);

    const recentTransactions = transactions.filter(t =>
        new Date(t.time) > twoMinutesAgo
    );

    return recentTransactions.length >= 3; // Retorna true si hay más de tres transacciones en los últimos 2 minutos.
}

function checkDoubledTransaction(newTransaction) {
    const twoMinutesAgo = new Date(newTransaction.time);
    twoMinutesAgo.setMinutes(twoMinutesAgo.getMinutes() - 2);

    return transactions.some(t => 
        t.merchant === newTransaction.merchant &&
        t.amount === newTransaction.amount &&
        new Date(t.time) > twoMinutesAgo
    );
}

// Endpoint para procesar operaciones, tanto de inicialización de cuenta como de transacciones.
app.post('/operations', (req, res) => {
    const { account: accountData, transaction } = req.body;
    violations = [];

    // Inicialización de cuenta
    if (accountData) {
        if (!account) {
            account = {
                activeCard: accountData['active-card'],
                availableLimit: accountData['available-limit']
            };
            transactions = [];
            violations = [];
        } else {
            violations.push("account-already-initialized");
        }
        return res.json({ account, violations });
    }

    // Procesar transacciones
    if (transaction) {
        if (!account) {
            violations.push("account-not-initialized");
        } else {
            // Comprueba alta frecuencia en intervalo corto.
            if (checkFrequency(transaction)) {
                violations.push("high-frequency-small-interval");
            }

            if (checkDoubledTransaction(transaction)) {
                violations.push("doubled-transaction");
            }

            if (account.activeCard === false) {
                violations.push("card-not-active");
            } else if (transaction.amount > account.availableLimit) {
                violations.push("insufficient-limit");
            } else if (violations.length === 0) { // Procesa la transacción solo si no hay violaciones.
                account.availableLimit -= transaction.amount;
                transactions.push(transaction); // Agrega la transacción a la lista de transacciones recientes.
            }


        }
        return res.json({ account, violations });
    }

    res.status(400).send("Invalid operation");
});

// Endpoint GET para verificar el estado de la cuenta y las violaciones.
app.get('/', (req, res) => {
    if (account) {
        res.json({ account, violations });
    } else {
        res.send('No account created yet.');
    }
});

// Inicia el servidor para escuchar en el puerto definido.
app.listen(port, () => {
    console.log(`Authorizer app listening at http://localhost:${port}`);
});


describe('POST /operations', () => {
    test('Create an account', async () => {
        const response = await request(app)
            .post('/operations')
            .send({
                account: { activeCard: true, availableLimit: 1000 }
            });
        expect(response.statusCode).toBe(200);
        expect(response.body.account).toEqual({
            activeCard: true,
            availableLimit: 1000
        });
        expect(response.body.violations).toEqual([]);
    });

    // Puedes añadir más pruebas aquí...
});
