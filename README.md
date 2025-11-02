<div align="center">

# 🏦 Datathon 2025 POLYFINANCES  
## **AI Legal Document Analyzer**

![Static Badge](https://img.shields.io/badge/Datathon-2025-blue?style=for-the-badge)
![Static Badge](https://img.shields.io/badge/Catégorie-Intelligence_Artificielle-orange?style=for-the-badge)
![Static Badge](https://img.shields.io/badge/Équipe-28-success?style=for-the-badge)

</div>

---

## 🧠 **Présentation du Projet**

Chattez avec vos documents PDF grâce à une puissante architecture **RAG (Retrieval-Augmented Generation)** entièrement déployée sur **AWS**.  
Notre application permet non seulement d’obtenir des **informations et conseils exploitables** à partir de documents complexes, mais aussi de **converser en temps réel** avec vos données.

*(Remplacez cette section par une capture d’écran de votre application en cours d’exécution)*

---

## ✨ **Fonctionnalités**

- **📄 Téléversement et visualisation de PDF :** Interface claire et réactive pour importer et afficher des documents légaux ou techniques.  
- **💬 Q&R conversationnelle :** Posez des questions et recevez des réponses contextualisées, avec références à la source.  
- **📚 Citations automatiques :** Chaque réponse inclut les pages ou sections pertinentes.  
- **✍️ Résumé instantané :** Sélectionnez du texte pour obtenir un résumé ou une explication rapide.  
- **🌓 Thème clair/sombre :** Interface moderne s’adaptant automatiquement.  
- **🔐 Sécurité :** Les données sont traitées localement dans un environnement AWS sécurisé.  

---

## ⚙️ **Architecture (RAG sur AWS)**

Notre solution repose sur un **système RAG (Retrieval-Augmented Generation)** permettant de combiner recherche sémantique et génération de texte fiable.

### **Flux de fonctionnement**

#### **1. Téléversement d’un document**

1. L’utilisateur envoie un fichier PDF via l’interface web.  
2. Le texte est extrait et découpé en segments sémantiques.  
3. Chaque segment est transformé en vecteur grâce aux **embeddings OpenAI**.  
4. Les embeddings sont stockés dans une base **DynamoDB** et un index vectoriel.  
5. Le fichier brut est conservé dans **Amazon S3**.  

#### **2. Interaction avec le document**

1. Lorsqu’une question est posée, un **Lambda** récupère les morceaux de texte les plus pertinents.  
2. Le contenu est combiné à la question pour former un prompt enrichi.  
3. L’IA génère une réponse contextualisée, fondée sur le contenu réel du document.  
4. Les échanges sont gérés par une **State Machine AWS Step Functions**.  

---

## 🧩 **Technologies utilisées**

| Domaine              | Technologies principales |
| -------------------- | ------------------------ |
| **Frontend**         | React, Vite, TypeScript, Tailwind CSS |
| **Backend**          | AWS Lambda, API Gateway, DynamoDB, S3, Step Functions |
| **RAG et IA**        | Python, LangChain, OpenAI API |
| **Déploiement**      | AWS Cloud Infrastructure |

---

## 👥 **Équipe #28**

- **Alexander Meriakri** — Développement Full Stack et déploiement de l’application  
- **Ayoub Khial** — Développement Full Stack et déploiement de l’application  
- **Leroy Tiojip** — Documentation RAG et contribution à la récupération de contexte  
- **William Dunwoody** — Conception complète de l’infrastructure AWS (pipelines, S3, Lambda, DynamoDB, Step Functions, etc.)

---

## 💡 **Ce qui rend notre solution unique**

Notre solution se démarque par une **intégration complète à l’écosystème AWS**, permettant une architecture **scalable, serverless et modulaire**.  
Elle ne se limite pas à une simple consultation des documents : l’utilisateur peut **interagir dynamiquement avec ses données** et obtenir des **conseils exploitables en continu**.

---

## 🔭 **Améliorations futures**

- **📈 Visualisation des données :** Intégration de graphiques et tableaux interactifs pour illustrer les tendances et corrélations.  
- **🤖 Prédictions de tendances :** Utilisation de modèles d’apprentissage automatique pour anticiper les évolutions ou anomalies dans les documents.  
- **⚡ Optimisation du RAG :** Raffinement du chunking et des embeddings pour des réponses plus rapides et précises.  

---

## 🚀 **Lancement du projet**

### **Prérequis**
- Node.js **v18+**  
- Python **v3.10+**  
- Clé API OpenAI valide  
- Compte AWS avec accès à Lambda, S3, DynamoDB et Step Functions  

---

### **1. Cloner le dépôt**
```bash
git clone https://github.com/votre-utilisateur/votre-projet.git
cd votre-projet
````

### **2. Démarrer le frontend**

```bash
cd Frontend
npm install
npm run dev
```

### **3. Démarrer le backend**

Les fonctions AWS Lambda se déploient automatiquement via la pipeline CI/CD.
Pour exécution locale :

```bash
cd Backend
python main.py
```

---

## 🏁 **Remerciements**

Merci à **PolyFinances** et à l’organisation du **Datathon 2025** pour cette opportunité d’explorer le potentiel de l’IA appliquée à l’analyse documentaire.

---

<div align="center">

👨‍💻 *Projet conçu avec passion par l’Équipe #28 — Datathon 2025 POLYFINANCES*

</div>
```
