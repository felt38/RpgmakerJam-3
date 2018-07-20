//=============================================================================
// ScienKunScript TitlesScreen (RPG Maker MV 1.5)
// SKS_TitleMap.js
// Version du script : 1.03
// Script qui permet d'utiliser une map en tant que Titlescreen
//=============================================================================


/*:fr
 * @plugindesc v1.03 Utilise une map en tant qu'écran-titre pour votre jeu.
 * Peut-être un tutoriel dessus un jour
 *
 * @author ScienKun
 *
 * @param ID MAP TITLE
 * @desc ID de la map servant d'écran titre
 * Par défaut : 1
 * @default 1
 *
 * @help ==================================FICHIER AIDE==================================
 * 
 * Ce script sert à remplacer l'écran-titre de base (Scene_Title) par une map créée
 * avec des événements ou autres. Cela facilite l'utilisation d'images, particules,
 * vidéos, boutons personnalisés et plein d'autres éléments.
 *
 * Contrairement à des scripts de type SkipTheTitle, ce script permet de revenir au
 * au menu réaliser sur la map et non au menu Scene_Title. (quand vous faites 
 * quitter depuis le menu du jeu). 
 *
 * Pour utiliser ce script je vous conseille de regarder le C1R n° 14 sur ma chaîne
 * YouTube. J'y explique comment le paramétrer et utiliser une carte comme écran-
 * titre. Lien de ma chaîne YouTube : https://www.youtube.com/c/superscientist
 *
 * ==============================COMMANDES DE MODULE===============================
 *
 * Lorsque vous voulez lancer une nouvelle partie depuis l'écran-titre, vous devrez
 * utiliser la commande suivante :
 *
 * TitleMap NEW 
 *
 * Lorque vous voulez accédez à l'écran des sauvegardes :
 *
 * TitleMap LOAD
 * 
 *
 * Lorque vous voulez activer la fenetre des Options depuis l'écran-titre, vous
 * devrez utiliser la commande suivante :
 *
 * TitleMap OPTIONS
 *
 *
 * Lorsque vous voulez quitter le jeu (fermer la fenêtre de jeu) depuis l'écran-
 * titre, vous devrez utiliser la commande suivante :
 *
 * TitleMap QUIT
 * Vous pouvez aussi juste utilisez le script close()
 *
 *
 * =====================================ASTUCES====================================
 *
 * Pour vérifier si la map fonctionne, vous pouvez créer un événement parallèle 
 * avec un Afficher les Choix ... et configurer les choix de cette manière :
 * Affichage : Sombre ; Position : Milieu ; Défaut : Choix 1 ; Annuler : Rejeter
 * Choix 1 : Nouvelle Partie { TitleMap NEW }
 * Choix 2 : Charger Partie { TitleMap LOAD }
 * Choix 3 : Options { TitleMap OPTIONS }
 * Choix 4 : Quitter { TitleMap QUIT }
 *
 * Je publierai probablement sur ma chaîne quelque exemples d'écran-titres fait 
 * avec des événements et ce plugin.
 *
 * ===================================CHANGELOGS===================================
 *
 * Version 1.03 : 21/08/2017 : 22h46
 * Le script agit maintenant sans modifier des éléments de la BDD.
 * Plus besoin de cocher Démarrage transparent, l'équipe est par défaut invisible
 * sur l'écran-titre.
 *
 * Version 1.02 : 13/07/2017 : 18h27
 * Ajout d'une correction en cas de Game Over
 *
 * Version 1.01 : 26/02/2017 : 18h10
 * Ajout des args NEW et HidePlayer, ShowPlayer
 *
 * Version 1.00 : 25/02/2017 : 19h30
 * Plugin terminé.
 *
 */
var Imported = Imported || {};
Imported.SKS_TitleMap = true;

var ScienKun = ScienKun || {};
ScienKun.TitleMap = ScienKun.TitleMap || {};
(function () {
	ScienKun.parameters = PluginManager.parameters('SKS_TitleMap');
	ScienKun.Param = ScienKun.Param || {};
	ScienKun.Param.idMapTitle = Number(ScienKun.parameters["ID MAP TITLE"] || 1);
	ScienKun.TitleMap.modeLoad = false;
	ScienKun.TitleMap.modeOption = false;


	Scene_Boot.prototype.start = function () {
		Scene_Base.prototype.start.call(this);
		SoundManager.preloadImportantSounds();
		if (DataManager.isBattleTest()) {
			DataManager.setupBattleTest();
			SceneManager.goto(Scene_Battle);
		} else if (DataManager.isEventTest()) {
			DataManager.setupEventTest();
			SceneManager.goto(Scene_Map);
		} else {
			this.checkPlayerLocation();
			DataManager.setupNewGame();
			if (Imported.SKS_HUD) {
				if (ScienKun.Param.basicVisiblity === 'false') {
					Window_HUDGauge.prototype.visiblity = false;
				} else {
					Window_HUDGauge.prototype.visiblity = true;
				}
				Window_Statut.prototype.visiblity = false;
			}
			$gameSystem.disableMenu();
			$gamePlayer.setTransparent(1);
			SceneManager.goto(Scene_Map);
			$gamePlayer.reserveTransfer(ScienKun.Param.idMapTitle, 1, 1, 0, 0);
		}
		this.updateDocumentTitle();
	};

	Scene_GameEnd.prototype.commandToTitle = function () {
		this.fadeOutAll();
		SceneManager.goto(Scene_Map);
		$gamePlayer.setTransparent(1);
		$gameSystem.disableMenu();
		$gamePlayer.reserveTransfer(ScienKun.Param.idMapTitle, 1, 1, 0, 0);
	};

	ScienKun.TitleMap.PluginManager = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function (command, args) {
		ScienKun.TitleMap.PluginManager.call(this, command, args);
		if (command === 'TitleMap') {
			switch (args[0]) {
				case 'NEW' :
					AudioManager.fadeOutBgm(3);
					DataManager.setupNewGame();
					$gameScreen.startFadeIn(5);
					break;
				case 'LOAD':
					SceneManager.goto(Scene_Load);
					return ScienKun.TitleMap.modeLoad = true;
					break;
				case 'OPTIONS':
					SceneManager.goto(Scene_Options);
					return ScienKun.TitleMap.modeOption = true;
					break;
				case 'QUIT':
					SceneManager.exit();
					break;
			}
		}
	};

	Scene_Load.prototype.createListWindow = function () {
		var x = 0;
		var y = this._helpWindow.height;
		var width = Graphics.boxWidth;
		var height = Graphics.boxHeight - y;
		this._listWindow = new Window_SavefileList(x, y, width, height);
		this._listWindow.setHandler('ok', this.onSavefileOk.bind(this));
		this._listWindow.setHandler('cancel', this.goBackToTitleMap.bind(this));
		this._listWindow.select(this.firstSavefileIndex());
		this._listWindow.setTopRow(this.firstSavefileIndex() - 2);
		this._listWindow.setMode(this.mode());
		this._listWindow.refresh();
		this.addWindow(this._listWindow);
	};

	Scene_Load.prototype.goBackToTitleMap = function () {
		ScienKun.TitleMap.modeLoad = false;
		SceneManager.goto(Scene_Map);
		$gamePlayer.setTransparent(1);
		$gameSystem.disableMenu();
		$gamePlayer.reserveTransfer(ScienKun.Param.idMapTitle, 1, 1, 0, 0);
	};

	ScienKun.TitleMap.OptionsWindow = Scene_Options.prototype.createOptionsWindow;
	Scene_Options.prototype.createOptionsWindow = function () {
		ScienKun.TitleMap.OptionsWindow.call(this);
		if (ScienKun.TitleMap.modeOption === true) {
			this._optionsWindow.setHandler('cancel', this.goBackToTitleMap.bind(this));
		} else if (ScienKun.TitleMap.modeOption === false) {
			this._optionsWindow.setHandler('cancel', this.popScene.bind(this));
		}
		this.addWindow(this._optionsWindow);
	};

	Scene_Options.prototype.goBackToTitleMap = function () {
		ScienKun.TitleMap.modeOption = false;
		SceneManager.goto(Scene_Map);
		$gamePlayer.setTransparent(1);
		$gameSystem.disableMenu();
		$gamePlayer.reserveTransfer(ScienKun.Param.idMapTitle, 1, 1, 0, 0);
	};
	
	Scene_Gameover.prototype.gotoTitle = function() {
		//$gameSystem.disableMenu();
		//$gamePlayer.setTransparent(1);
		SceneManager.goto(Scene_Boot);
		//$gamePlayer.reserveTransfer(ScienKun.Param.idMapTitle, 1, 1, 0, 0);
};


})();