# KulinerIn Cloud Computing

<img src="https://github.com/user-attachments/assets/51baabe0-5054-47ec-bacf-4788182e28cc" width="100%" height="50%">

## Technology Used

#### Cloud SQL
<img src="https://github.com/user-attachments/assets/48a4947e-5f04-465e-920a-9e0b783f39a4" width="65px" height="80px">
<br><pre>
   <span style="font-size: 18px; color: #3366cc;">Database Type: MySQL</span>
   <span style="font-size: 18px; color: #3366cc;">Region : asia-southeast2 (Jakarta)</span>
   <span style="font-size: 18px; color: #3366cc;">DB Version : MySQL 8.4.3</span>
   <span style="font-size: 18px; color: #3366cc;">vCPUs : 1 </span>
   <span style="font-size: 18px; color: #3366cc;">RAM : 3.75 GB </span>
   <span style="font-size: 18px; color: #3366cc;">Storage : 10 GB </span>
</pre>

#### Cloud Storage
<img src="https://github.com/user-attachments/assets/20dca4e9-c90f-4407-ba19-f8e26904be7d" width="65px" height="75px">
<br>
<pre>
   <span style="font-size: 18px; color: #3366cc;">Location Type : Region </span>
   <span style="font-size: 18px; color: #3366cc;">Location : asia-southeast2 (Jakarta)</span>
   <span style="font-size: 18px; color: #3366cc;">Storage Class : Standard</span>
</pre>

#### Cloud Run
<img src="https://github.com/user-attachments/assets/923f743f-7692-422a-9de1-c15758396fa2" width="70px" height="75px">
<br>
<pre>
   <span style="font-size: 18px; color: #3366cc;">Location : asia-southeast2 (Jakarta) </span>
   <span style="font-size: 18px; color: #3366cc;">Memory : 2 GB </span>
   <span style="font-size: 18px; color: #3366cc;">vCPUs : 1 </span>
</pre>

#### Container Registry
<img src="https://github.com/user-attachments/assets/fafa3fa6-7621-41c1-9eae-68f6902ef33b" width="70px" height="75px">
<br>
<pre>
   <span style="font-size: 18px; color: #3366cc;">Format : Docker</span>
   <span style="font-size: 18px; color: #3366cc;">Type : Standard</span>
   <span style="font-size: 18px; color: #3366cc;">Location : asia-southeast2 (Jakarta)</span>
</pre>

## API Documentation
The KulinerIn API Documentation provides detailed information about all available endpoints, including authentication, user profile, food discovery, and AI-powered food prediction features.
Explore it here: [KulinerIn API Documentation](https://www.postman.com/bangkit-capstone-kulinerin/kulinerin-workspace/documentation/leceuv3/kulinerin-api-documentation)

## Installation

1. Clone the repository:

   ```bash
   https://github.com/Kulinerin-Bangkit-Team-2024/Cloud-Computing.git

2. Navigate to the project directory:

   ```bash
   cd Cloud-Computing

3. Install dependencies:

   ```bash
   npm install

4. create .env from .env.example file

   ```bash
   # Database configuration
   DATABASE_HOST='your-database-host'
   DATABASE_USER='your-database-username'
   DATABASE_PASSWORD='your-database-password'
   DATABASE='your-database-name'
   
   # Connect to Flask Framework for model
   ML_MODEL='your-framework-model-link'
   
   # JWT (JSON Web Token) secret for authentication
   JWT_SECRET='your-jwt-secret'
   
   # Google Cloud Storage bucket name
   BUCKET_NAME='your-bucket-name'
   
   # Email service configuration
   EMAIL_USER='your-email-address'
   EMAIL_PASS='your-email-password'

5. Set up a Google Cloud service account:
   ```bash
   1. Go to the Google Cloud Console.
   2. Navigate to IAM & Admin > Service Accounts.
   3. Create a service account with a role allowing file uploads to your bucket (e.g., "Storage Object Admin").
   4. Download the key as a JSON file.
   5. Save it in the project root as key.json.

6. Start :
   ```bash
   node server.js