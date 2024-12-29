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
