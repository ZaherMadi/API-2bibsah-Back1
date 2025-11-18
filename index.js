const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Données des spécialités médicales (temporaire sans DB)
const specialites = {
  dentiste: {
    nom: "Chirurgien Dentiste",
    description: "Retrouvez vos chirurgiens dentistes qualifiés pour tous vos soins bucco-dentaires",
    icon: "🦷"
  },
  pediatre: {
    nom: "Pédiatre",
    description: "Consultez nos pédiatres spécialisés dans la santé et le bien-être de vos enfants",
    icon: "👶"
  },
  generaliste: {
    nom: "Médecin Généraliste",
    description: "Trouvez un médecin généraliste pour vos consultations de routine et soins primaires",
    icon: "⚕️"
  },
  cardiologue: {
    nom: "Cardiologue",
    description: "Spécialistes du cœur et du système cardiovasculaire à votre service",
    icon: "❤️"
  },
  dermatologue: {
    nom: "Dermatologue",
    description: "Experts en soins de la peau, cheveux et ongles",
    icon: "💆"
  },
  ophtalmologue: {
    nom: "Ophtalmologue",
    description: "Prenez soin de votre vue avec nos ophtalmologues qualifiés",
    icon: "👁️"
  }
};

// Route principale - Page d'accueil
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint - Obtenir toutes les spécialités
app.get('/api/v1/docteur', (req, res) => {
  const { specialite } = req.query;
  
  if (specialite) {
    const spec = specialites[specialite.toLowerCase()];
    if (spec) {
      res.json({
        success: true,
        specialite: specialite,
        data: spec
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Spécialité non trouvée. Spécialités disponibles: " + Object.keys(specialites).join(', ')
      });
    }
  } else {
    res.json({
      success: true,
      message: "Retrouvez vos chirurgiens dentistes, pédiatres, médecins généralistes, cardiologues, dermatologues, ophtalmologues et bien plus encore!",
      specialites: specialites
    });
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🌍 Serveur API 2Bibsah démarré sur le port ${PORT}`);
  console.log(`📍 Accédez à l'API: http://localhost:${PORT}/api/v1/docteur`);
});
