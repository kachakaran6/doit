# DoIt v0.1.0 — First Production Release (Build 1)

Welcome to the first official production release of **DoIt** (`v0.1.0+1`), a precision personal and team productivity platform engineered for speed, focus, and durability.

---

## What's New in v0.1.0+1

### 📱 Android Native Experience (`apps/mobile`)
- **Linear-Grade Precision Interface**: Fully revamped dark theme built on a neutral graphite foundation (`#101113` background, `#17191C` card surfaces, `#7775D8` restrained indigo accent).
- **Task Hub & Kanban Board**: Drag-and-drop state transitions, custom sorting, priority flags (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), and hierarchical project categorization.
- **Sticky Notes**: Fast 2-column masonry scratchpad for unstructured notes, thoughts, and quick capture.
- **Voice Memos & Audio Capture**: High-fidelity native audio recording with background transcription support.
- **Offline-First Synchronization**: Optimistic UI mutations cached locally with automatic background retry and conflict resolution.
- **Floating Signature Navbar**: Ergonomic thumb-zone bottom navigation with 56dp quick-action hub.

### 🌐 Scalable Backend Infrastructure (`apps/api`)
- **Production Deployment on Coolify**: Self-hosted NestJS 10 modular monolith running in an Alpine container under `tini` supervision.
- **PostgreSQL 16 & Prisma ORM**: Auto-synchronizing relational data models with strict schema constraints and indexed queries.
- **Zero-Downtime TLS**: Integrated with Caddy Reverse Proxy for automated Let's Encrypt certificates and HTTP/2 + HTTP/3 support.
- **Enterprise-Grade Security**:
  - Argon2id cryptographic password hashing.
  - Rotating JWT Access & Refresh token family with device session revocation.
  - Rate limiting (60 req/min per IP) and strict CORS policies.
  - Non-root container runtime (`app:app`).

---

## 📦 Release Assets & Verification

| Asset | Type | Description |
| :--- | :--- | :--- |
| `DoIt-v0.1.0-build1.apk` | Android APK | Signed standalone installable APK (`com.samyukt.doit`, version `0.1.0`, build `1`) |
| `DoIt-v0.1.0-build1.apk.sha256` | Checksum | SHA-256 integrity hash |

---

## 🚀 Installation & Getting Started

1. Download `DoIt-v0.1.0-build1.apk` on your Android device (Android 9.0+).
2. Allow installation from unknown sources when prompted.
3. Launch DoIt and connect to the live cloud backend or self-host your own instance using Docker Compose.

---

## 📚 Technical Documentation

- [Architecture & Topology Specification](docs/ARCHITECTURE.md)
- [REST API & OpenAPI Specification](docs/API.md)
- [Production Deployment Guide](docs/PRODUCTION-DEPLOYMENT.md)
- [Release Engineering & Versioning Guide](docs/RELEASE-GUIDE.md)
- [End-User & Self-Host Installation Guide](docs/INSTALLATION.md)
