// ⚠️ IMPORTANT: Charger les variables d'environnement EN PREMIER
import './config/env';
// ⚠️ IMPORTANT: Charger les types Express étendus (doit être importé pour être actif)
import './types/express';

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

// Configuration
import swaggerSpecs from './config/swagger';
import { env } from './config/env';
import { prisma } from './config/database';

// Routes
import authRoutes from './routes/auth.routes';
import appointmentRoutes from './routes/appointment.routes';
import slotRoutes from './routes/slot.routes';
import prescriptionRoutes from './routes/prescription.routes';
import paymentRoutes from './routes/payment.routes';
import notificationRoutes from './routes/notification.routes';
import auditRoutes from './routes/audit.routes';
import statsRoutes from './routes/stats.routes';

// Middlewares
import { authMiddleware } from './middlewares/auth.middleware';
import { errorMiddleware } from './middlewares/error.middleware';

const app: Application = express();
const PORT = env.PORT;

// Middleware
// Configuration CORS plus sécurisée
const corsOptions = {
  origin: env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Swagger Documentation
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css";

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
    customCssUrl: CSS_URL,
    customJs: [
        "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js",
        "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js"
    ]
}));
console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);

// Routes
// Note: Auth middleware is applied globally or per route. 
// For this example, let's assume some routes might be public, but most are private.
// Applying authMiddleware to /api would protect all routes.
// app.use('/api', authMiddleware) // Uncomment to protect all routes
// For now we will apply it conceptually or inside specific routers if needed.

// Health check endpoint (public, pas besoin d'auth)
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
  });
});

// Routes publiques (sans authentification)
// Données des spécialités médicales (temporaire, sera remplacé par la BDD plus tard)
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

// Route publique pour les spécialités médicales
app.get('/api/v1/docteur', (req: Request, res: Response) => {
  const { specialite } = req.query;
  
  if (specialite && typeof specialite === 'string') {
    const spec = specialites[specialite.toLowerCase() as keyof typeof specialites];
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

// Routes d'authentification (PUBLIQUES - pas besoin de token)
app.use('/api/auth', authRoutes);

// Using authMiddleware for all API routes as per requirements (User injection)
// Note: Les routes définies AVANT cette ligne sont publiques
app.use('/api', authMiddleware);

// Routes protégées (nécessitent un token JWT)
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors/:id/slots', slotRoutes); // Specific slot routes
app.use('/api/slots', slotRoutes); // General slot routes
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/auditlog', auditRoutes);
app.use('/api/stats', statsRoutes);

// Root Endpoint
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error Handling Middleware (Must be last)
app.use(errorMiddleware);

// Fonction pour démarrer le serveur
async function startServer() {
  try {
    // Tester la connexion à la base de données
    await prisma.$connect();
    console.log('✅ Connexion à la base de données réussie');

    // Démarrer le serveur
    // Écouter sur 0.0.0.0 pour accepter les connexions depuis Docker
    app.listen(PORT, '0.0.0.0', () => {
      console.log(` Serveur démarré sur le port ${PORT}`);
      console.log(`API disponible: http://localhost:${PORT}`);
      console.log(`Documentation Swagger: http://localhost:${PORT}/api-docs`);
      console.log(`Environnement: ${env.NODE_ENV}`);
      console.log(`Adminer disponible: http://localhost:8080`);
    });
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

// Gérer l'arrêt propre du serveur
process.on('SIGINT', async () => {
  console.log('\nArrêt du serveur...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nArrêt du serveur...');
  await prisma.$disconnect();
  process.exit(0);
});

// Démarrer le serveur
startServer();

export default app;
