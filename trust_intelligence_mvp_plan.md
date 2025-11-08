# ⚡ MVP Build Plan — Trust Intelligence (3 Hours)

## Objective
Deliver a functional prototype demonstrating content bias simulation and visualization.

---

## 🕒 Hour 1 — Setup & Foundations
### Tasks
1. **Initialize Next.js project**
   - Create app with TailwindCSS styling (dark theme).  
   - Add main pages: `/`, `/simulate`.  
2. **Design Layout**
   - Sidebar (mode selector: Social / Prompt).  
   - Input area + "Simulate" button.  
   - Placeholder graph canvas.
3. **Connect Backend**
   - Setup FastAPI/Node endpoint `/analyze`.  
   - Accept POST `{ content, type }`.  
   - Return mock bias score + sentiment data.

---

## 🕒 Hour 2 — Simulation & Visualization
### Tasks
1. **Graph Visualization**
   - Integrate D3.js or Cytoscape.js for network graph.  
   - Display 50+ nodes with random demographics.  
   - Color nodes by sentiment polarity (blue → red).  
2. **Bias Scoring Mock**
   - Implement basic text analysis (e.g., OpenAI API sentiment).  
   - Assign simulated group bias weights.  
3. **UI Polish**
   - Add neon palette (blue, purple, teal).  
   - Dark background, clean layout.

---

## 🕒 Hour 3 — Reporting & Polish
### Tasks
1. **Bias & Trust Report**
   - Show summary card with Bias Score + recommendations.  
   - Export PDF using jsPDF.  
2. **Prompt Optimization**
   - Add “Improve Text” suggestion via LLM API call.  
3. **Final Demo Prep**
   - Record example simulation (e.g., LinkedIn post).  
   - Ensure responsive design & functional flow.

---

## ✅ Deliverables
- Live prototype with bias simulation UI.  
- Working API returning bias data.  
- Interactive visualization of simulated group reactions.  
- Exportable bias report (PDF).  
