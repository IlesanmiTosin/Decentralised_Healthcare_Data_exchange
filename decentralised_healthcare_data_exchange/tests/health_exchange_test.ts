
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure that patient data can be stored and updated",
    async fn(chain: Chain, accounts: Map<string, Account>)
    {
        const patient = accounts.get("wallet_1")!;
        const dataHash = '0x0000000000000000000000000000000000000000000000000000000000000001';

        let block = chain.mineBlock([
            Tx.contractCall(
                "health_exchange",
                "store-advanced-data",
                [
                    types.buff(dataHash),
                    types.ascii("MEDICAL_HISTORY"),
                    types.uint(2)
                ],
                patient.address
            )
        ]);
        assertEquals(block.receipts[0].result, '(ok true)');

        // Try to update the data
        const newDataHash = '0x0000000000000000000000000000000000000000000000000000000000000002';
        block = chain.mineBlock([
            Tx.contractCall(
                "health_exchange",
                "update-data",
                [types.buff(newDataHash)],
                patient.address
            )
        ]);
        assertEquals(block.receipts[0].result, '(ok true)');
    }
});

Clarinet.test({
    name: "Ensure proper access control for healthcare providers",
    async fn(chain: Chain, accounts: Map<string, Account>)
    {
        const patient = accounts.get("wallet_1")!;
        const provider = accounts.get("wallet_2")!;

        let block = chain.mineBlock([
            // Grant access
            Tx.contractCall(
                "health_exchange",
                "grant-access",
                [types.principal(provider.address)],
                patient.address
            ),
            // Check access
            Tx.contractCall(
                "health_exchange",
                "check-access",
                [
                    types.principal(patient.address),
                    types.principal(provider.address)
                ],
                provider.address
            ),
            // Revoke access
            Tx.contractCall(
                "health_exchange",
                "revoke-access",
                [types.principal(provider.address)],
                patient.address
            )
        ]);

        assertEquals(block.receipts[0].result, '(ok true)');
        assertEquals(block.receipts[1].result, 'true');
        assertEquals(block.receipts[2].result, '(ok true)');
    }
});

Clarinet.test({
    name: "Ensure research proposal submission and approval process",
    async fn(chain: Chain, accounts: Map<string, Account>)
    {
        const researcher = accounts.get("wallet_1")!;
        const deployer = accounts.get("deployer")!;

        let block = chain.mineBlock([
            // Submit research proposal
            Tx.contractCall(
                "health_exchange",
                "submit-research-proposal",
                [
                    types.uint(1),
                    types.ascii("COVID-19 Research"),
                    types.ascii("Study on long-term effects"),
                    types.list([types.ascii("age"), types.ascii("symptoms")]),
                    types.uint(1000)
                ],
                researcher.address
            ),
            // Approve proposal
            Tx.contractCall(
                "health_exchange",
                "approve-research-proposal",
                [
                    types.principal(researcher.address),
                    types.uint(1)
                ],
                deployer.address
            )
        ]);

        assertEquals(block.receipts[0].result, '(ok true)');
        assertEquals(block.receipts[1].result, '(ok true)');
    }
});

Clarinet.test({
    name: "Ensure provider credentials management",
    async fn(chain: Chain, accounts: Map<string, Account>)
    {
        const provider = accounts.get("wallet_1")!;
        const deployer = accounts.get("deployer")!;
        const credentialHash = '0x0000000000000000000000000000000000000000000000000000000000000001';

        let block = chain.mineBlock([
            // Register provider credentials
            Tx.contractCall(
                "health_exchange",
                "register-provider-credentials",
                [
                    types.ascii("General Hospital"),
                    types.buff(credentialHash)
                ],
                provider.address
            ),
            // Verify credentials
            Tx.contractCall(
                "health_exchange",
                "verify-provider-credentials",
                [types.principal(provider.address)],
                deployer.address
            )
        ]);

        assertEquals(block.receipts[0].result, '(ok true)');
        assertEquals(block.receipts[1].result, '(ok true)');
    }
});

Clarinet.test({
    name: "Ensure patient consent preferences management",
    async fn(chain: Chain, accounts: Map<string, Account>)
    {
        const patient = accounts.get("wallet_1")!;

        let block = chain.mineBlock([
            // Set consent preferences
            Tx.contractCall(
                "health_exchange",
                "set-consent-preferences",
                [
                    types.bool(true),   // allow-anonymous-research
                    types.bool(false),  // allow-identifiable-research
                    types.bool(true)    // notify-on-access
                ],
                patient.address
            )
        ]);

        assertEquals(block.receipts[0].result, '(ok true)');
    }
});

Clarinet.test({
    name: "Ensure proper logging of data access",
    async fn(chain: Chain, accounts: Map<string, Account>)
    {
        const patient = accounts.get("wallet_1")!;
        const provider = accounts.get("wallet_2")!;

        let block = chain.mineBlock([
            // Log data access
            Tx.contractCall(
                "healthcare_data_exchange",
                "log-data-access",
                [
                    types.principal(patient.address),
                    types.principal(provider.address),
                    types.list([types.ascii("medical_history"), types.ascii("medications")]),
                    types.ascii("Regular checkup")
                ],
                provider.address
            )
        ]);

        assertEquals(block.receipts[0].result, '(ok true)');
    }
});

Clarinet.test({
    name: "Ensure research contributions are properly recorded",
    async fn(chain: Chain, accounts: Map<string, Account>)
    {
        const patient = accounts.get("wallet_1")!;
        const researcher = accounts.get("wallet_2")!;

        let block = chain.mineBlock([
            // Record first contribution
            Tx.contractCall(
                "healthcare_data_exchange",
                "record-research-contribution",
                [types.principal(researcher.address)],
                patient.address
            ),
            // Record second contribution (should get different token amount)
            Tx.contractCall(
                "healthcare_data_exchange",
                "record-research-contribution",
                [types.principal(researcher.address)],
                patient.address
            )
        ]);

        assertEquals(block.receipts[0].result, '(ok true)');
        assertEquals(block.receipts[1].result, '(ok true)');
    }
});

Clarinet.test({
    name: "Ensure proper data access request handling",
    async fn(chain: Chain, accounts: Map<string, Account>)
    {
        const patient = accounts.get("wallet_1")!;
        const researcher = accounts.get("wallet_2")!;

        // First set consent preferences
        let block = chain.mineBlock([
            Tx.contractCall(
                "healthcare_data_exchange",
                "set-consent-preferences",
                [types.bool(true), types.bool(true), types.bool(true)],
                patient.address
            ),
            // Request data access
            Tx.contractCall(
                "healthcare_data_exchange",
                "request-data-access",
                [
                    types.principal(patient.address),
                    types.list([types.ascii("age"), types.ascii("gender")]),
                    types.ascii("Research study")
                ],
                researcher.address
            )
        ]);

        assertEquals(block.receipts[0].result, '(ok true)');
        assertEquals(block.receipts[1].result, '(ok true)');
    }
});