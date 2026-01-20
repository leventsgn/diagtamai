# Diagram AI

AI-powered diagram generator with interactive visual editor.

## 🚀 Live Demo

- **Frontend**: https://leventsgn.github.io/diagtamai/
- **Backend API**: Deploy to Render.com (see below)

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/leventsgn/diagtamai.git
cd diagtamai/diagram-ai
npm install
```

### Run Locally

```bash
npm run dev
```

This will start:
- Web app: http://localhost:5173
- API server: http://localhost:3001

## 🌐 Deployment

### Frontend (GitHub Pages)

Frontend is automatically deployed to GitHub Pages on every push to main branch.

### Backend (Render.com)

1. Create a free account on [Render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml` and configure the service
5. Click "Create Web Service"

After deployment, update your frontend LLM settings with the Render backend URL.

## 📝 Configuration

Open the app and click on "⚙️ LLM Ayarları" to configure:
- **URL**: Your LLM API endpoint (OpenAI compatible)
- **Model**: Model name to use
- **Bearer Token**: Your API key

Settings are stored in browser localStorage.

## 🎯 Features

- AI-powered diagram generation
- Interactive diagram editor with drag & drop
- Multiple node types (process, decision, start, end, actor, group)
- Auto-layout support
- Dark mode
- Real-time updates

## 📜 License

MIT
