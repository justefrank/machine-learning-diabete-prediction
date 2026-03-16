// ===== SCRIPT.JS - VERSION PROFESSIONNELLE =====
// Application de prédiction du diabète

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    // Initialisation de toutes les fonctionnalités
    initFormValidation();
    initFormAnimation();
    initTooltips();
    initSmoothScroll();
    initDarkMode();
    initInputMasks();
    initResultAnimation();
    initLoadingState();
});

// ===== 1. VALIDATION DU FORMULAIRE =====
function initFormValidation() {
    const form = document.getElementById('predictionForm');
    
    if (!form) return;

    // Validation en temps réel
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            validateInput(this);
        });

        input.addEventListener('blur', function() {
            validateInput(this, true);
        });
    });

    // Validation à la soumission
    form.addEventListener('submit', function(e) {
        let isValid = true;
        inputs.forEach(input => {
            if (!validateInput(input, true)) {
                isValid = false;
            }
        });

        if (!isValid) {
            e.preventDefault();
            showNotification('Veuillez corriger les erreurs dans le formulaire', 'error');
            
            // Scroll vers le premier champ invalide
            const firstInvalid = form.querySelector('.input-error');
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
}

// Fonction de validation par champ
function validateInput(input, showError = false) {
    const value = parseFloat(input.value);
    const min = parseFloat(input.min) || 0;
    const max = parseFloat(input.max) || Infinity;
    const name = input.name;
    
    let isValid = true;
    let errorMessage = '';

    // Vérifier si le champ est vide
    if (!input.value && input.required) {
        isValid = false;
        errorMessage = 'Ce champ est requis';
    }
    // Vérifier les valeurs minimales
    else if (value < min) {
        isValid = false;
        errorMessage = `La valeur minimale est ${min}`;
    }
    // Vérifier les valeurs maximales
    else if (value > max) {
        isValid = false;
        errorMessage = `La valeur maximale est ${max}`;
    }
    // Validations spécifiques par champ
    else {
        switch(name) {
            case 'Glucose':
                if (value < 70 || value > 300) {
                    isValid = false;
                    errorMessage = 'Le glucose doit être entre 70 et 300 mg/dL';
                }
                break;
            case 'BMI':
                if (value < 10 || value > 80) {
                    isValid = false;
                    errorMessage = 'L\'IMC doit être entre 10 et 80 kg/m²';
                }
                break;
            case 'BloodPressure':
                if (value < 40 || value > 200) {
                    isValid = false;
                    errorMessage = 'La pression doit être entre 40 et 200 mm Hg';
                }
                break;
            case 'Age':
                if (value < 1 || value > 120) {
                    isValid = false;
                    errorMessage = 'L\'âge doit être entre 1 et 120 ans';
                }
                break;
        }
    }

    // Mise à jour de l'interface
    const formGroup = input.closest('.form-group');
    const existingError = formGroup.querySelector('.error-message');
    
    if (!isValid && showError) {
        input.classList.add('input-error');
        
        // Ajouter ou mettre à jour le message d'erreur
        if (!existingError) {
            const error = document.createElement('small');
            error.className = 'error-message';
            error.textContent = errorMessage;
            error.style.color = 'var(--danger-color)';
            error.style.fontSize = '0.85rem';
            error.style.marginTop = '0.25rem';
            formGroup.appendChild(error);
        } else {
            existingError.textContent = errorMessage;
        }
    } else {
        input.classList.remove('input-error');
        if (existingError) {
            existingError.remove();
        }
    }

    return isValid;
}

// ===== 2. ANIMATIONS DU FORMULAIRE =====
function initFormAnimation() {
    const formGroups = document.querySelectorAll('.form-group');
    
    formGroups.forEach(group => {
        const input = group.querySelector('input');
        const label = group.querySelector('label');
        
        if (input && label) {
            // Animation au focus
            input.addEventListener('focus', () => {
                label.style.color = 'var(--primary-color)';
                label.style.transform = 'translateX(5px)';
            });

            input.addEventListener('blur', () => {
                label.style.color = '';
                label.style.transform = '';
            });

            // Animation si le champ est rempli
            if (input.value) {
                label.style.fontWeight = 'bold';
            }

            input.addEventListener('input', () => {
                if (input.value) {
                    label.style.fontWeight = 'bold';
                } else {
                    label.style.fontWeight = 'normal';
                }
            });
        }
    });
}

// ===== 3. TOOLTIPS =====
function initTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    
    tooltips.forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            const tooltip = e.target.getAttribute('data-tooltip');
            console.log(`Tooltip: ${tooltip}`); // Pour le débogage
        });
    });
}

// ===== 4. SCROLL DOUX =====
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Mettre à jour l'URL sans recharger
                history.pushState(null, null, targetId);
            }
        });
    });
}

// ===== 5. MODE SOMBRE =====
function initDarkMode() {
    // Créer le bouton de mode sombre
    const header = document.querySelector('.header');
    if (!header) return;
    
    const darkModeBtn = document.createElement('button');
    darkModeBtn.className = 'dark-mode-toggle';
    darkModeBtn.innerHTML = '<i class="fas fa-moon"></i>';
    darkModeBtn.setAttribute('aria-label', 'Basculer le mode sombre');
    
    // Style du bouton
    darkModeBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--primary-color);
        color: white;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(darkModeBtn);
    
    // Vérifier les préférences système
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
        enableDarkMode();
        darkModeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Gestionnaire d'événement
    darkModeBtn.addEventListener('click', () => {
        if (document.body.classList.contains('dark-mode')) {
            disableDarkMode();
            darkModeBtn.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            enableDarkMode();
            darkModeBtn.innerHTML = '<i class="fas fa-sun"></i>';
        }
    });
}

function enableDarkMode() {
    document.body.classList.add('dark-mode');
    
    // Variables CSS pour le mode sombre
    const style = document.createElement('style');
    style.id = 'dark-mode-styles';
    style.textContent = `
        .dark-mode {
            --bg-color: #1a1a2e;
            --text-color: #fff;
            --card-bg: #16213e;
            --input-bg: #0f3460;
        }
        
        .dark-mode body {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        }
        
        .dark-mode .card {
            background: var(--card-bg);
            color: var(--text-color);
        }
        
        .dark-mode input {
            background: var(--input-bg);
            color: var(--text-color);
            border-color: #0f3460;
        }
        
        .dark-mode .form-group label {
            color: #fff;
        }
        
        .dark-mode .text-muted {
            color: #a0a0a0;
        }
    `;
    
    document.head.appendChild(style);
    localStorage.setItem('darkMode', 'enabled');
}

function disableDarkMode() {
    document.body.classList.remove('dark-mode');
    const darkStyles = document.getElementById('dark-mode-styles');
    if (darkStyles) {
        darkStyles.remove();
    }
    localStorage.setItem('darkMode', 'disabled');
}

// ===== 6. MASQUES DE SAISIE =====
function initInputMasks() {
    const glucoseInput = document.querySelector('input[name="Glucose"]');
    const bmiInput = document.querySelector('input[name="BMI"]');
    const ageInput = document.querySelector('input[name="Age"]');
    
    // Formatage automatique
    if (glucoseInput) {
        glucoseInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9.]/g, '');
        });
    }
    
    if (bmiInput) {
        bmiInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9.]/g, '');
        });
    }
    
    if (ageInput) {
        ageInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    }
}

// ===== 7. ANIMATION DES RÉSULTATS =====
function initResultAnimation() {
    const resultSection = document.querySelector('.result-section');
    
    if (resultSection) {
        // Animation d'entrée
        resultSection.style.opacity = '0';
        resultSection.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            resultSection.style.transition = 'all 0.5s ease';
            resultSection.style.opacity = '1';
            resultSection.style.transform = 'translateY(0)';
        }, 100);
        
        // Animation de la barre de progression
        const probabilityBar = document.querySelector('.probability-fill');
        if (probabilityBar) {
            const width = probabilityBar.style.width;
            probabilityBar.style.width = '0%';
            
            setTimeout(() => {
                probabilityBar.style.transition = 'width 1s ease';
                probabilityBar.style.width = width;
            }, 300);
        }
    }
}

// ===== 8. ÉTAT DE CHARGEMENT =====
function initLoadingState() {
    const form = document.getElementById('predictionForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('button[type="submit"]');
            
            // Désactiver le bouton
            submitBtn.disabled = true;
            submitBtn.classList.add('btn-loading');
            
            // Sauvegarder le texte original
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Prédiction en cours...';
            
            // Réactiver après 10 secondes (au cas où)
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.classList.remove('btn-loading');
                submitBtn.innerHTML = originalText;
            }, 10000);
        });
    }
}

// ===== 9. SYSTÈME DE NOTIFICATION =====
function showNotification(message, type = 'info') {
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${getIconForType(type)}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Style de la notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${getColorForType(type)};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Animation de fermeture
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        margin-left: 10px;
    `;
    
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto-fermeture après 5 secondes
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

function getIconForType(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

function getColorForType(type) {
    switch(type) {
        case 'success': return '#4cc9f0';
        case 'error': return '#f72585';
        case 'warning': return '#f8961e';
        default: return '#4361ee';
    }
}

// ===== 10. SAUVEGARDE LOCALE =====
function initLocalStorage() {
    const form = document.getElementById('predictionForm');
    
    if (form) {
        // Charger les données sauvegardées
        const savedData = localStorage.getItem('diabeteFormData');
        if (savedData) {
            const data = JSON.parse(savedData);
            Object.keys(data).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    input.value = data[key];
                }
            });
        }
        
        // Sauvegarder à chaque modification
        form.addEventListener('input', () => {
            const formData = {};
            const inputs = form.querySelectorAll('input');
            inputs.forEach(input => {
                formData[input.name] = input.value;
            });
            localStorage.setItem('diabeteFormData', JSON.stringify(formData));
        });
        
        // Bouton pour effacer
        const resetBtn = form.querySelector('button[type="reset"]');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                localStorage.removeItem('diabeteFormData');
            });
        }
    }
}

// ===== 11. STATISTIQUES EN TEMPS RÉEL =====
function initRealTimeStats() {
    const form = document.getElementById('predictionForm');
    if (!form) return;
    
    const statsContainer = document.createElement('div');
    statsContainer.className = 'real-time-stats';
    statsContainer.style.cssText = `
        background: rgba(255,255,255,0.1);
        padding: 1rem;
        border-radius: 8px;
        margin-top: 1rem;
        font-size: 0.9rem;
    `;
    
    form.appendChild(statsContainer);
    
    form.addEventListener('input', () => {
        const bmi = parseFloat(form.querySelector('[name="BMI"]')?.value);
        const glucose = parseFloat(form.querySelector('[name="Glucose"]')?.value);
        const age = parseFloat(form.querySelector('[name="Age"]')?.value);
        
        let stats = '<strong>Aperçu en temps réel :</strong><br>';
        
        if (bmi) {
            const category = bmi < 18.5 ? 'Insuffisance pondérale' :
                           bmi < 25 ? 'Poids normal' :
                           bmi < 30 ? 'Surpoids' : 'Obésité';
            stats += `IMC : ${category}<br>`;
        }
        
        if (glucose) {
            const glucoseCategory = glucose < 100 ? 'Normal' :
                                   glucose < 126 ? 'Pré-diabète' : 'Élevé';
            stats += `Glucose : ${glucoseCategory}<br>`;
        }
        
        if (age) {
            stats += `Âge : ${age} ans<br>`;
        }
        
        statsContainer.innerHTML = stats;
    });
}

// ===== 12. INITIALISATION COMPLÈTE =====
// Appeler toutes les fonctions d'initialisation
initLocalStorage();
initRealTimeStats();

// Ajouter les animations CSS nécessaires
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .input-error {
        border-color: var(--danger-color) !important;
        background-color: rgba(247, 37, 133, 0.05) !important;
    }
    
    .btn-loading {
        position: relative;
        pointer-events: none;
        opacity: 0.7;
    }
    
    .btn-loading i {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

document.head.appendChild(style);

// ===== 13. SERVICE WORKER (OPTIONNEL) =====
// Pour le mode hors ligne
if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
            console.log('Service Worker registration failed:', error);
        });
    });
}