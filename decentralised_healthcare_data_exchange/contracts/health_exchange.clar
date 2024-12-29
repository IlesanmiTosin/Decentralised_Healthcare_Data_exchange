;; Healthcare Data Exchange Platform Smart Contract

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-insufficient-tokens (err u103))
(define-constant err-already-contributed (err u104))
(define-constant err-data-exists (err u105))
(define-constant err-invalid-request (err u106))

;; Data Variables
(define-map patient-data { patient: principal } 
  { data-hash: (buff 32), 
  is-shared: bool, 
  consent-timestamp: uint,
  data-type: (string-ascii 50),
  sensitivity-level: uint  
  })


(define-map access-permissions { patient: principal, provider: principal } { can-access: bool, access-timestamp: uint  })
(define-map research-contributions { patient: principal, researcher: principal } { contribution-count: uint, last-contribution-timestamp: uint })

(define-map access-logs { 
  patient: principal, 
  provider: principal, 
  access-timestamp: uint 
} { 
  accessed-fields: (list 10 (string-ascii 50)),
  access-purpose: (string-ascii 100)
})

(define-map research-proposals {
  researcher: principal,
  proposal-id: uint
} {
  research-title: (string-ascii 100),
  description: (string-ascii 500),
  required-fields: (list 10 (string-ascii 50)),
  approved: bool,
  funding-requested: uint
})

(define-map patient-consent-preferences { 
  patient: principal 
} { 
  allow-anonymous-research: bool,
  allow-identifiable-research: bool,
  notify-on-access: bool
})

(define-map provider-credentials {
  provider: principal
} {
  institution: (string-ascii 100),
  credential-hash: (buff 32),
  verification-status: bool
})


;; Fungible Token
(define-fungible-token data-token u1000000000)

;; Private Functions
(define-private (is-contract-owner)
  (is-eq tx-sender contract-owner))

(define-private (mint-research-tokens (amount uint))
  (ft-mint? data-token amount tx-sender))

;; Check if a provider has access to a patient's data
(define-read-only (check-access (patient principal) (provider principal))
  (default-to false (get can-access (map-get? access-permissions { patient: patient, provider: provider }))))

;; Get patient data hash
(define-read-only (get-patient-data (patient principal))
  (match (map-get? patient-data { patient: patient })
    data-info (ok (get data-hash data-info))
    (err err-not-found)))

;; Get Research Proposal Details
(define-read-only (get-research-proposal (researcher principal) (proposal-id uint))
  (map-get? research-proposals { researcher: researcher, proposal-id: proposal-id }))

;; Get Provider Verification Status
(define-read-only (check-provider-credentials (provider principal))
  (match (map-get? provider-credentials { provider: provider })
    credentials (ok (get verification-status credentials))
    (err err-not-found)))
