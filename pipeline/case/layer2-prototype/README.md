# Smart-JAMPS: Layer 2 Proposal & Statutory Synthesis Engine
**Placemaking | Agency Navigation | Dual-Grant Optimization | Axonometric Layering**

This package contains the complete, standalone frontend application for **Layer 2 (Proposal Layer)** of the **Smart-JAMPS** (`Jamie-petro/Smart-JAMPS`) multi-agency placemaking system.

---

## 🚀 How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open in browser
# http://localhost:3000
```

---

## 📦 How to Integrate into the GitHub Repo (`Jamie-petro/Smart-JAMPS`)

Since you are handing this off to your teammate with push access, they have two simple ways to integrate it:

### Option A: As a Dedicated Sub-Module / Folder in `Smart-JAMPS` (Recommended)
1. Clone the main repository:
   ```bash
   git clone https://github.com/Jamie-petro/Smart-JAMPS.git
   cd Smart-JAMPS
   ```
2. Create a new branch:
   ```bash
   git checkout -b feature/layer-2-proposal-engine
   ```
3. Copy this extracted `arts-to-places-sg` directory into the repo under `layers/layer-2-proposal/` (or `client/`):
   ```bash
   mkdir -p layers
   cp -r /path/to/extracted/arts-to-places-sg layers/layer-2-proposal
   ```
4. Commit and push:
   ```bash
   git add layers/layer-2-proposal
   git commit -m "feat(layer-2): integrate proposal synthesis engine with 3D axonometric and agency workplans"
   git push origin feature/layer-2-proposal-engine
   ```
5. Open a Pull Request on GitHub to merge into `main`.

---

## 🌟 What This Layer Provides to the Smart-JAMPS Architecture

1. **Layer 1 Consumption**: Ingests site coordinates, Cadastral Lots (SLA SVY21), and infrastructure buffers (LTA viaduct heights, Rail Corridor linkages).
2. **Interactive 3D Axonometric Visualizer**:
   - Macro Singapore animated map featuring Henning Larsen's 21.5km North-South Corridor (NSC) "Life Reserve" typology segments.
   - Exploded micro-axonometric spatial model separating Cadastre, Utilities, Arts Program, and Regulatory Envelopes.
3. **Agency Sequencing Engine**:
   - Clear timeline (`T-12 to T-10 wks` SLA TOL, `T-8 wks` LTA, `T-6 wks` SPF PLRD, `T-4 wks` SFA, `T-3 wks` SCDF/BCA).
4. **Co-Funding & Anti-Double-Dipping Guardrails**:
   - Bifurcated budget audit separating MCCY OurSG and NAC Presentation & Participation grants.
5. **Interactive Placemaking Chatbot**:
   - Context-aware advisory assistant with one-click enhancement application.
6. **Exportable PDF Dossier**:
   - One-click print/PDF generator for submission packs.
