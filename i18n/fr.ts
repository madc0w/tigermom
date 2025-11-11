export const fr = {
	app: {
		title: 'TutorLux',
		logoAlt: 'Logo TutorLux',
		tagline: 'Restez organisé. Maîtrisez vos tâches.',
	},
	auth: {
		signIn: 'Se connecter',
		signUp: "S'inscrire",
		signOut: 'Se déconnecter',
		welcome: 'Bienvenue, {name} !',
		signingIn: 'Connexion en cours…',
		creatingAccount: 'Création du compte…',
		createYourAccount: 'Créez votre compte',
		email: 'Email',
		emailPlaceholder: 'vous@exemple.com',
		password: 'Mot de passe',
		passwordPlaceholder: 'Au moins 8 caractères',
		firstName: 'Prénom',
		lastName: 'Nom',
		phone: 'Téléphone (optionnel)',
		phonePlaceholder: '+33 6 12 34 56 78',
		noAccount: 'Pas de compte ?',
		createOne: 'Créez-en un',
		alreadyHaveAccount: 'Vous avez déjà un compte ?',
		passwordMinLength: 'Le mot de passe doit contenir au moins 8 caractères',
		failedToSignIn: 'Échec de la connexion',
		failedToSignUp: "Échec de l'inscription",
	},
	tasks: {
		addPlaceholder: 'Ajouter une tâche...',
		addButton: 'Ajouter',
		addingButton: 'Ajout...',
		loading: 'Chargement...',
		pleaseSignIn: 'Veuillez vous connecter pour voir et ajouter des tâches.',
		emptyState:
			'Aucune tâche pour le moment. Ajoutez-en une ci-dessus pour commencer !',
	},
	features: {
		simpleTaskManagement: {
			title: 'Gestion Simple des Tâches',
			description: 'Ajoutez et suivez vos tâches en toute simplicité.',
		},
		secureAndPrivate: {
			title: 'Sécurisé et Privé',
			description: 'Vos données sont protégées et privées.',
		},
		fastAndResponsive: {
			title: 'Rapide et Réactif',
			description: "Conçu pour la vitesse et l'efficacité",
		},
	},
	settings: {
		title: 'Paramètres',
		accountSettings: 'Paramètres du Compte',
		personalInformation: 'Informations Personnelles',
		updateProfile: 'Mettre à jour le profil',
		updating: 'Mise à jour...',
		changePassword: 'Changer le mot de passe',
		currentPassword: 'Mot de passe actuel',
		currentPasswordPlaceholder: 'Entrez votre mot de passe actuel',
		newPassword: 'Nouveau mot de passe',
		newPasswordPlaceholder: 'Au moins 8 caractères',
		confirmPassword: 'Confirmer le nouveau mot de passe',
		confirmPasswordPlaceholder: 'Ressaisissez votre nouveau mot de passe',
		updatePassword: 'Mettre à jour le mot de passe',
		updatingPassword: 'Mise à jour...',
		successProfileUpdated: 'Profil mis à jour avec succès !',
		successPasswordUpdated: 'Mot de passe mis à jour avec succès !',
		errorUpdateFailed: 'Échec de la mise à jour. Veuillez réessayer.',
		errorPasswordMismatch: 'Les mots de passe ne correspondent pas',
		errorPasswordTooShort:
			'Le mot de passe doit contenir au moins 8 caractères',
		backToHome: "Retour à l'accueil",
		accountInformation: 'Informations du Compte',
		memberSince: 'Membre depuis',
		leavePasswordBlank: 'Laissez vide pour conserver le mot de passe actuel',
		passwordsDoNotMatch: 'Les nouveaux mots de passe ne correspondent pas',
	},
	email: {
		fromEmail: 'support@tutorlux.com',
		fromName: 'TutorLux',
		appName: 'TutorLux',
		welcomeSubject: 'Bienvenue sur TutorLux !',
		welcomeTextBody: `Bonjour {name},

Bienvenue sur {appName} ! Nous sommes ravis de vous compter parmi nous.

{appName} vous aide à rester organisé et à maîtriser vos tâches. Vous pouvez commencer à ajouter des tâches immédiatement et les gérer efficacement.

Si vous avez des questions ou besoin d'aide, n'hésitez pas à nous contacter.

Cordialement,
L'équipe {appName}`,
		welcomeHeading: 'Bienvenue sur {appName} ! 🎉',
		greeting: 'Bonjour <strong>{name}</strong>,',
		welcomeMessage: 'Nous sommes ravis de vous compter parmi nous !',
		descriptionMessage:
			'{appName} vous aide à rester organisé et à maîtriser vos tâches. Vous pouvez commencer à ajouter des tâches immédiatement et les gérer efficacement.',
		gettingStartedHeading: 'Pour Commencer',
		step1: 'Connectez-vous à votre compte',
		step2: 'Ajoutez votre première tâche',
		step3: 'Restez organisé et productif',
		helpMessage:
			"Si vous avez des questions ou besoin d'aide, n'hésitez pas à nous contacter.",
		closingMessage: 'Cordialement,',
		signature: "L'équipe {appName}",
	},
	tutorCategories: {
		math: {
			_: 'Mathématiques',
			algebra: 'Algèbre',
			geometry: 'Géométrie',
			calculus: 'Calcul',
		},
		science: {
			_: 'Sciences',
			physics: 'Physique',
			chemistry: 'Chimie',
			biology: 'Biologie',
		},
		languages: {
			_: 'Langues',
			english: 'Anglais',
			spanish: 'Espagnol',
			french: 'Français',
			chinese: 'Chinois',
			luxembourgish: 'Luxembourgeois',
			german: 'Allemand',
		},
		sports: {
			_: 'Sports',
			tennis: 'Tennis',
		},
		other: 'Autre',
	},
	tutorSearch: {
		searchPlaceholder: 'Rechercher des catégories de tuteurs...',
		loadingTutors: 'Chargement des tuteurs...',
		availableTutors: 'Tuteurs Disponibles',
		noTutorsFound: 'Aucun tuteur trouvé pour cette catégorie.',
		tableName: 'Nom',
		tableEmail: 'Email',
		tablePhone: 'Téléphone',
		tableRate: 'Tarif/Heure',
		tableCategories: 'Catégories',
	},
	languages: {
		en: 'Anglais (English)',
		fr: 'Français',
	},
} as const;

export type Translations = typeof fr;
