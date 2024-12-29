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