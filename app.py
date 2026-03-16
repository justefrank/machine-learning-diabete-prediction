from flask import Flask, render_template, request
import joblib
import numpy as np
import pandas as pd
import warnings

warnings.filterwarnings('ignore')

app = Flask(__name__)

# ===== CHARGEMENT DU MODÈLE ET DU SCALER =====

model = joblib.load("model/modele_diabete_logistic.pkl")
scaler = joblib.load("model/scaler.pkl")  # IMPORTANT: Chargez le scaler!

print(f"Modèle chargé: {type(model).__name__}")
print(f"Scaler chargé: {type(scaler).__name__}")



@app.route('/')
def home():
    return render_template("index.html")


@app.route('/predict', methods=['POST'])
def predict():
    try:
        # ===== 1. RÉCUPÉRATION DES DONNÉES =====
        Pregnancies = float(request.form['Pregnancies'])
        Glucose = float(request.form['Glucose'])
        BloodPressure = float(request.form['BloodPressure'])
        SkinThickness = float(request.form['SkinThickness'])
        Insulin = float(request.form['Insulin'])
        BMI = float(request.form['BMI'])
        DiabetesPedigreeFunction = float(request.form['DiabetesPedigreeFunction'])
        Age = float(request.form['Age'])

        # ===== 2. CRÉATION DU DATAFRAME =====
        data = pd.DataFrame([[Pregnancies, Glucose, BloodPressure, SkinThickness,
                              Insulin, BMI, DiabetesPedigreeFunction, Age]],
                            columns=['Pregnancies', 'Glucose', 'BloodPressure',
                                     'SkinThickness', 'Insulin', 'BMI',
                                     'DiabetesPedigreeFunction', 'Age'])

        # ===== 3. VALIDATION DES DONNÉES =====
        validation_errors = []
        if Glucose < 50 or Glucose > 300:
            validation_errors.append("Glucose hors norme (doit être entre 50 et 300)")
        if BMI < 10 or BMI > 80:
            validation_errors.append("IMC hors norme (doit être entre 10 et 80)")
        if Age < 1 or Age > 120:
            validation_errors.append("Âge hors norme (doit être entre 1 et 120)")

        if validation_errors:
            return render_template("index.html",
                                   prediction_text="Erreur de validation",
                                   probability=None,
                                   color="orange",
                                   recommandation=" | ".join(validation_errors))

        # ===== 4. STANDARDISATION (TRÈS IMPORTANT!) =====
        data_scaled = scaler.transform(data)

        # ===== 5. PRÉDICTION =====
        prediction = model.predict(data_scaled)[0]

        # ===== 6. PROBABILITÉ =====
        try:
            proba = model.predict_proba(data_scaled)[0]
            probability = round(proba[1] * 100, 2)

            # ALERTE: Si probabilité trop parfaite (100% ou 0%)
            if probability == 100.0 or probability == 0.0:
                print(f"ALERTE: Probabilité extrême de {probability}%")
                print(f"   Données: {data.values[0]}")
        except:
            probability = None

        # ===== 7. INTERPRÉTATION =====
        if prediction == 1:
            result = "Patient diabétique"
            color = "red"
            recommandation = "⚠️ Consultez un médecin pour un diagnostic approfondi."

            # Ajouter un message si probabilité extrême
            if probability == 100.0:
                recommandation += " (Résultat extrême - à vérifier)"
        else:
            result = "Patient non diabétique"
            color = "green"
            recommandation = "Continuez à maintenir un mode de vie sain."

            if probability == 0.0:
                recommandation += " (Résultat extrême - à vérifier)"

        # ===== 8. AFFICHAGE POUR DEBUG =====
        print(f"Prédiction: {result}")
        print(f"Probabilité: {probability}%")
        print(f"Données brutes: {data.values[0]}")
        print(f"Données scalées: {data_scaled[0]}")

        return render_template("index.html",
                               prediction_text=result,
                               probability=probability,
                               color=color,
                               recommandation=recommandation)

    except Exception as e:
        print(f"Erreur: {e}")
        return render_template("index.html",
                               prediction_text="Erreur technique",
                               probability=None,
                               color="orange",
                               recommandation=f"Veuillez réessayer. Détail: {str(e)}")


if __name__ == "__main__":
    app.run(debug=True)