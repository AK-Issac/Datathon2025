<div align="center">

# 🏦 Datathon 2025 POLYFINANCES  
# 🐍 S3rpent  

![Static Badge](https://img.shields.io/badge/Datathon-2025-blue?style=for-the-badge)
![Static Badge](https://img.shields.io/badge/Catégorie-Intelligence_Artificielle-orange?style=for-the-badge)
![Static Badge](https://img.shields.io/badge/Équipe-28-success?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Frontend-Next.js-blue?logo=nextdotjs)
![Flask](https://img.shields.io/badge/Backend-Flask-lightgrey?logo=flask)
![AWS](https://img.shields.io/badge/Cloud-AWS-orange?logo=amazonaws)
![Hackathon](https://img.shields.io/badge/Projet-Datathon%202025%20PolyFinances-success?logo=hackclub)
![License](https://img.shields.io/badge/Licence-MIT-green)

</div>


## 🧠 **Présentation du Projet**

Chattez avec vos documents PDF grâce à une puissante architecture **RAG (Retrieval-Augmented Generation)** entièrement déployée sur **AWS**.  
Notre application permet non seulement d’obtenir des **informations et conseils exploitables** à partir de documents complexes, mais aussi de **converser en temps réel** avec vos données.

- 🎥 [Voir la démonstration sur YouTube](https://www.youtube.com/watch?v=VOTRE_VIDEO_ID)
- 💻 [Voir la soumission sur Devpost](https://devpost.com/software/VOTRE_PROJET)
- 🌐 [Essayer l'outil vous même](https://datathon2025-ashen.vercel.app/)


## 🚀 Fonctionnalités principales  

- 📄 **Téléversement intelligent de documents** : supporte les fichiers financiers et législatifs volumineux.  
- ⚙️ **Pipeline AWS automatisé** : nettoyage, segmentation et traitement parallèle orchestrés via Step Functions.  
- 📊 **Analyse d’impact et de risque** : identifie les secteurs les plus exposés et suggère des ajustements de pondération.  
- 💬 **Chatbot RAG** : permet d’interagir directement avec les rapports et le portefeuille, en langage naturel.  
- 🧾 **Rapports exécutifs** : résumés clairs présentant les risques, métriques clés et estimations financières.  


## ⚙️ **Architecture (RAG sur AWS)**

Notre solution repose sur un **système RAG (Retrieval-Augmented Generation)** permettant de combiner recherche sémantique et génération de texte fiable.

### ⚙️ Fonctionnement du système  

1. **Téléversement du fichier**  
   - L’utilisateur charge un document (rapport financier, projet de loi, etc.).  
   - Le fichier est stocké dans **Amazon S3**, ce qui déclenche une fonction Lambda.  

2. **Nettoyage et segmentation**  
   - Le document est normalisé et découpé en **fragments** pour permettre un traitement parallèle.  

3. **Orchestration Step Functions**  
   - Une **machine d’états** gère cinq étapes principales :  
     1. Lister les fragments disponibles.  
     2. Lancer en parallèle une analyse LLM pour chaque fragment (extraction d’impacts, métriques, risques).  
     3. Agréger les résultats pour former un rapport complet.  
     4. Générer un résumé concis et filtré.  
     5. Comparer les données avec le portefeuille enregistré dans **DynamoDB** et produire des recommandations.  

4. **Génération d’insights**  
   - LLM produit un résumé lisible par l’humain : zones de risque, impact financier, conseils stratégiques, etc.  

5. **Intégration à la base de connaissances**  
   - Les rapports finaux sont synchronisés avec une **AWS Knowledge Base**.  
   - Un **chatbot RAG** permet d’interroger les données 


## 🧩 **Technologies utilisées**

**Frontend :** Next.js  
**Backend :** Flask  
**Cloud & Infrastructure :**  
AWS Lambda · Amazon S3 · Step Functions · DynamoDB · Elastic Beanstalk · Amazon Bedrock (LLMs + Agent Core) · IAM · AWS Knowledge Bases  
*(Architecture 100 % serverless et cloud-native)*


## 👥 **Équipe #28**

- **Alexander Meriakri** — Développement Full Stack et déploiement de l’application  
- **Ayoub Khial** — Développement Full Stack et déploiement de l’application  
- **Leroy Tiojip** — Documentation RAG et contribution à la récupération de contexte  
- **William Dunwoody** — Conception complète de l’infrastructure AWS (pipelines, S3, Lambda, DynamoDB, Step Functions, etc.)


## 💡 **Ce qui rend notre solution unique**

Notre solution se démarque par une **intégration complète à l’écosystème AWS**, permettant une architecture **scalable, serverless et modulaire**.  
De plus, elle ne se limite pas à une simple consultation des documents : l’utilisateur peut **interagir dynamiquement avec ses données** et obtenir des **conseils exploitables**.


## 🔭 **Améliorations futures**

- **📈 Visualisation des données :** Intégration de graphiques et tableaux interactifs pour illustrer les tendances et corrélations.  
- **⚡ Optimisation du RAG :** Raffinement du chunking et des embeddings pour des réponses plus rapides et précises.  


## 🏁 **Remerciements**

Merci à **PolyFinances** et à l’organisation du **Datathon 2025** pour cette opportunité d’explorer le potentiel de l’IA appliquée à l’analyse documentaire.


<div align="center">

👨‍💻 *Projet conçu avec passion par l’Équipe #28 — Datathon 2025 POLYFINANCES*

</div>
