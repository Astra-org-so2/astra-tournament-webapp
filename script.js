// Главный класс приложения для Astra Tournament S1
class AstraTournamentApp {
    constructor() {
        this.dataKey = 'astraTournamentData';
        this.settingsKey = 'astraTournamentSettings';
        this.userRegistrationKey = 'userRegistration';
        this.syncKey = 'astraSyncQueue';
        
        // URL Google Apps Script (будет загружен из настроек)
        this.googleScriptURL = '';
        this.isOnline = navigator.onLine;
        
        this.init();
    }

    // Инициализация приложения
    init() {
        // Инициализация данных
        this.initializeData();
        
        // Настройка DOM
        this.setupDOM();
        
        // Загрузка данных
        this.loadData();
        
        // Настройка обработчиков событий
        this.setupEventListeners();
        
        // Создание полей для игроков
        this.createPlayerFields();
        
        // Проверка подключения к интернету
        this.setupOnlineCheck();
        
        // Запуск синхронизации
        this.startSyncService();
    }

    // Инициализация данных в localStorage
    initializeData() {
        if (!localStorage.getItem(this.dataKey)) {
            const initialData = {
                teams: [],
                tournament: {
                    name: "Astra Tournament S1",
                    status: "registration",
                    startDate: "15.11.2023",
                    regEndDate: "10.11.2023",
                    format: "5x5, Single Elimination",
                    prizePool: "50.000 рублей",
                    description: "Добро пожаловать на турнир Astra Tournament S1 по Standoff 2 от организации Astra Org! Приглашаем команды соревноваться за звание лучших."
                },
                lastId: 0,
                settings: {
                    registrationOpen: true,
                    maxTeams: 32,
                    requireApproval: true,
                    googleScriptURL: "",
                    enableSync: true
                }
            };
            localStorage.setItem(this.dataKey, JSON.stringify(initialData));
        }
        
        if (!localStorage.getItem(this.settingsKey)) {
            const settings = {
                adminPassword: "astra2023",
                contactEmail: "astra.org@example.com",
                sheetsPassword: "astra2023"
            };
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
        }
        
        // Инициализация очереди синхронизации
        if (!localStorage.getItem(this.syncKey)) {
            localStorage.setItem(this.syncKey, JSON.stringify([]));
        }
    }

    // Загрузка данных
    loadData() {
        this.data = JSON.parse(localStorage.getItem(this.dataKey));
        this.settings = JSON.parse(localStorage.getItem(this.settingsKey));
        this.userRegistration = JSON.parse(localStorage.getItem(this.userRegistrationKey));
        this.syncQueue = JSON.parse(localStorage.getItem(this.syncKey));
        
        // Загружаем URL Google Script из настроек
        this.googleScriptURL = this.data.settings.googleScriptURL || '';
        
        this.updateUI();
    }

    // Сохранение данных
    saveData() {
        localStorage.setItem(this.dataKey, JSON.stringify(this.data));
        localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
    }

    // Сохранение очереди синхронизации
    saveSyncQueue() {
        localStorage.setItem(this.syncKey, JSON.stringify(this.syncQueue));
    }

    // Настройка DOM элементов
    setupDOM() {
        this.elements = {
            // Основные элементы
            tabs: document.querySelectorAll('.tab'),
            tabContents: document.querySelectorAll('.tab-content'),
            teamsCount: document.getElementById('teamsCount'),
            teamsCountDisplay: document.getElementById('teamsCountDisplay'),
            teamsList: document.getElementById('teamsList'),
            registrationForm: document.getElementById('registrationForm'),
            successMessage: document.getElementById('successMessage'),
            goToRegisterBtn: document.getElementById('goToRegisterBtn'),
            editRegistrationBtn: document.getElementById('editRegistrationBtn'),
            backToInfoBtn: document.getElementById('backToInfoBtn'),
            submitBtn: document.getElementById('submitBtn'),
            submitText: document.getElementById('submitText'),
            userStatus: document.getElementById('userStatus'),
            notification: document.getElementById('notification'),
            mainPlayersContainer: document.getElementById('mainPlayers'),
            
            // Статус турнира
            tournamentStatus: document.getElementById('tournamentStatus'),
            statusBadge: document.getElementById('statusBadge'),
            startDate: document.getElementById('startDate'),
            startDateInfo: document.getElementById('startDateInfo'),
            regEndDate: document.getElementById('regEndDate'),
            tournamentDescription: document.getElementById('tournamentDescription'),
            tournamentFormat: document.getElementById('tournamentFormat'),
            prizePool: document.getElementById('prizePool'),
            
            // Поиск и фильтры
            teamSearch: document.getElementById('teamSearch'),
            registrationIdDisplay: document.getElementById('registrationIdDisplay'),
            successMessageText: document.getElementById('successMessageText'),
            
            // Форма регистрации
            registrationId: document.getElementById('registrationId'),
            teamName: document.getElementById('teamName'),
            teamTag: document.getElementById('teamTag'),
            telegram: document.getElementById('telegram'),
            vk: document.getElementById('vk'),
            email: document.getElementById('email'),
            
            // Синхронизация
            syncStatusCard: document.getElementById('syncStatusCard'),
            sheetsSyncIcon: document.getElementById('sheetsSyncIcon'),
            sheetsStatus: document.getElementById('sheetsStatus'),
            syncInfo: document.getElementById('syncInfo')
        };
    }

    // Создание полей для игроков
    createPlayerFields() {
        this.elements.mainPlayersContainer.innerHTML = '';
        
        for (let i = 1; i <= 5; i++) {
            const playerRow = document.createElement('div');
            playerRow.className = 'player-row';
            playerRow.innerHTML = `
                <div class="player-id">
                    <label class="player-label">Игровое ID игрока ${i} *</label>
                    <input type="text" class="input-field main-id" required 
                           placeholder="ID игрока ${i}" maxlength="20" data-index="${i}">
                    <div class="error-text" id="playerIdError${i}"></div>
                </div>
                <div class="player-nickname">
                    <label class="player-label">Никнейм игрока ${i} *</label>
                    <input type="text" class="input-field main-nickname" required 
                           placeholder="Никнейм игрока ${i}" maxlength="20" data-index="${i}">
                    <div class="error-text" id="playerNickError${i}"></div>
                </div>
            `;
            this.elements.mainPlayersContainer.appendChild(playerRow);
        }
    }

    // Обновление интерфейса
    updateUI() {
        // Обновление счетчика команд
        const confirmedTeams = this.data.teams.filter(team => team.status === 'confirmed');
        this.elements.teamsCount.textContent = confirmedTeams.length;
        this.elements.teamsCountDisplay.textContent = this.data.teams.length;
        
        // Обновление информации о турнире
        this.elements.tournamentStatus.textContent = this.getStatusText(this.data.tournament.status);
        this.elements.startDate.textContent = this.data.tournament.startDate;
        this.elements.startDateInfo.textContent = this.data.tournament.startDate;
        this.elements.regEndDate.textContent = this.data.tournament.regEndDate;
        this.elements.tournamentDescription.textContent = this.data.tournament.description;
        this.elements.tournamentFormat.textContent = this.data.tournament.format;
        this.elements.prizePool.textContent = this.data.tournament.prizePool;
        
        // Обновление статуса турнира
        this.updateTournamentStatus();
        
        // Обновление статуса пользователя
        this.updateUserStatus();
        
        // Обновление списка команд
        this.renderTeamsList();
        
        // Обновление статуса синхронизации
        this.updateSyncStatus();
    }

    // Обновление статуса турнира
    updateTournamentStatus() {
        const status = this.data.tournament.status;
        this.elements.statusBadge.textContent = this.getStatusBadgeText(status);
        this.elements.statusBadge.className = 'status-badge ' + status;
        
        // Если регистрация закрыта, скрываем кнопку регистрации
        if (status === 'closed' || !this.data.settings.registrationOpen) {
            this.elements.goToRegisterBtn.style.display = 'none';
        }
    }

    // Обновление статуса пользователя
    updateUserStatus() {
        if (this.userRegistration) {
            const team = this.data.teams.find(t => t.id === this.userRegistration.teamId);
            if (team) {
                let statusText = `Ваша команда "${team.name}" зарегистрирована. `;
                let statusClass = '';
                
                switch(team.status) {
                    case 'pending':
                        statusText += 'Статус: <span class="status-badge pending">Ожидает подтверждения</span>';
                        statusClass = 'warning';
                        break;
                    case 'confirmed':
                        statusText += 'Статус: <span class="status-badge confirmed">Подтверждена</span>';
                        statusClass = 'success';
                        break;
                    case 'rejected':
                        statusText += 'Статус: <span class="status-badge rejected">Отклонена</span>';
                        statusClass = 'danger';
                        break;
                }
                
                this.elements.userStatus.innerHTML = statusText;
                this.elements.userStatus.style.color = `var(--${statusClass})`;
                this.elements.goToRegisterBtn.style.display = 'none';
                this.elements.editRegistrationBtn.style.display = 'block';
                
                // Заполняем форму данными пользователя
                this.fillFormWithUserData();
            }
        } else {
            this.elements.userStatus.textContent = "Вы еще не зарегистрированы на турнир";
            this.elements.userStatus.style.color = "var(--warning)";
            this.elements.goToRegisterBtn.style.display = "block";
            this.elements.editRegistrationBtn.style.display = "none";
        }
    }

    // Заполнение формы данными пользователя
    fillFormWithUserData() {
        if (!this.userRegistration || !this.elements.registrationForm) return;
        
        const team = this.data.teams.find(t => t.id === this.userRegistration.teamId);
        if (!team) return;
        
        this.elements.registrationId.value = team.id;
        this.elements.teamName.value = team.name;
        this.elements.teamTag.value = team.tag;
        this.elements.telegram.value = team.contacts.telegram || '';
        this.elements.vk.value = team.contacts.vk || '';
        this.elements.email.value = team.contacts.email || '';
        
        // Заполняем основных игроков
        team.players.forEach((player, index) => {
            const inputs = document.querySelectorAll(`.main-id[data-index="${index + 1}"]`);
            const nicknameInputs = document.querySelectorAll(`.main-nickname[data-index="${index + 1}"]`);
            
            if (inputs[0]) inputs[0].value = player.id;
            if (nicknameInputs[0]) nicknameInputs[0].value = player.nickname;
        });
        
        // Заполняем запасного игрока
        if (team.reservePlayer) {
            document.querySelector('.reserve-id').value = team.reservePlayer.id;
            document.querySelector('.reserve-nickname').value = team.reservePlayer.nickname;
        }
    }

    // Отрисовка списка команд
    renderTeamsList(filter = 'all', searchQuery = '') {
        this.elements.teamsList.innerHTML = '';
        
        let teamsToShow = this.data.teams;
        
        // Применяем фильтр
        if (filter !== 'all') {
            teamsToShow = teamsToShow.filter(team => team.status === filter);
        }
        
        // Применяем поиск
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            teamsToShow = teamsToShow.filter(team => 
                team.name.toLowerCase().includes(query) || 
                team.tag.toLowerCase().includes(query)
            );
        }
        
        if (teamsToShow.length === 0) {
            this.elements.teamsList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <i class="fas fa-users" style="font-size: 48px; margin-bottom: 20px; opacity: 0.3;"></i>
                    <p>${searchQuery ? 'Команды не найдены' : 'Пока ни одна команда не зарегистрирована'}</p>
                </div>
            `;
            return;
        }
        
        teamsToShow.forEach(team => {
            const teamCard = document.createElement('div');
            teamCard.className = 'team-card';
            
            let contactsHTML = '';
            if (team.contacts.telegram) {
                contactsHTML += `<div><i class="fab fa-telegram contact-icon"></i> ${team.contacts.telegram}</div>`;
            }
            if (team.contacts.vk) {
                contactsHTML += `<div><i class="fab fa-vk contact-icon"></i> ${team.contacts.vk}</div>`;
            }
            if (team.contacts.email) {
                contactsHTML += `<div><i class="fas fa-envelope contact-icon"></i> ${team.contacts.email}</div>`;
            }
            
            teamCard.innerHTML = `
                <div class="team-name">
                    ${team.name}
                    <span class="team-status ${team.status}">${this.getStatusText(team.status)}</span>
                </div>
                <div class="team-tag">${team.tag}</div>
                <div class="team-contacts">${contactsHTML}</div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">
                    Зарегистрирована: ${team.registrationDate}
                    ${team.syncedWithSheets ? ' • <i class="fas fa-cloud" style="color: var(--success);"></i>' : 
                      team.syncFailed ? ' • <i class="fas fa-cloud" style="color: var(--danger);"></i>' : 
                      ' • <i class="fas fa-desktop" style="color: var(--warning);"></i>'}
                </div>
            `;
            
            this.elements.teamsList.appendChild(teamCard);
        });
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Обработчики для вкладок
        this.elements.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });

        // Кнопка перехода к регистрации
        this.elements.goToRegisterBtn.addEventListener('click', () => {
            this.switchTab('register');
        });

        // Кнопка редактирования регистрации
        this.elements.editRegistrationBtn.addEventListener('click', () => {
            this.switchTab('register');
        });

        // Кнопка возврата к информации
        this.elements.backToInfoBtn.addEventListener('click', () => {
            this.elements.successMessage.classList.remove('active');
            this.switchTab('info');
        });

        // Поиск команд
        if (this.elements.teamSearch) {
            this.elements.teamSearch.addEventListener('input', (e) => {
                const searchQuery = e.target.value;
                const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
                this.renderTeamsList(activeFilter, searchQuery);
            });
        }

        // Фильтры команд
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const filter = e.target.dataset.filter;
                const searchQuery = this.elements.teamSearch?.value || '';
                this.renderTeamsList(filter, searchQuery);
            });
        });

        // Обработка отправки формы
        this.elements.registrationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });
        
        // Обработка изменения полей формы для валидации
        this.setupFormValidation();
    }

    // Настройка валидации формы
    setupFormValidation() {
        const validateField = (field, validator) => {
            field.addEventListener('blur', () => {
                validator(field);
            });
            field.addEventListener('input', () => {
                this.clearError(field);
            });
        };
        
        // Валидация названия команды
        validateField(this.elements.teamName, (field) => {
            if (field.value.trim().length < 3) {
                this.showError(field, 'Название должно быть не менее 3 символов');
            }
        });
        
        // Валидация тега команды
        validateField(this.elements.teamTag, (field) => {
            const tag = field.value.trim().toUpperCase();
            if (tag.length < 2 || tag.length > 6) {
                this.showError(field, 'Тег должен быть от 2 до 6 символов');
            }
        });
        
        // Валидация Telegram
        validateField(this.elements.telegram, (field) => {
            const value = field.value.trim();
            if (value && !value.startsWith('@') && !value.startsWith('https://t.me/')) {
                this.showError(field, 'Введите @username или https://t.me/username');
            }
        });
    }

    // Переключение вкладок
    switchTab(tabId) {
        this.elements.tabs.forEach(t => t.classList.remove('active'));
        this.elements.tabContents.forEach(content => content.classList.remove('active'));
        
        document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(`${tabId}-tab`).classList.add('active');
    }

    // Обработка отправки формы
    async handleFormSubmit() {
        if (!this.validateForm()) {
            this.showNotification("Заполните все обязательные поля правильно", "error");
            return;
        }
        
        // Проверяем, открыта ли регистрация
        if (this.data.tournament.status === 'closed' || !this.data.settings.registrationOpen) {
            this.showNotification("Регистрация на турнир закрыта", "error");
            return;
        }
        
        // Проверяем максимальное количество команд
        if (this.data.teams.length >= this.data.settings.maxTeams) {
            this.showNotification("Достигнуто максимальное количество команд", "error");
            return;
        }
        
        const formData = this.collectFormData();
        const isEditMode = !!this.elements.registrationId.value;
        
        // Показываем индикатор загрузки
        this.elements.submitBtn.disabled = true;
        this.elements.submitText.innerHTML = '<div class="loading"></div> Отправка...';
        
        try {
            if (isEditMode) {
                // Редактирование существующей заявки
                await this.updateRegistration(formData);
            } else {
                // Новая регистрация
                await this.createRegistration(formData);
            }
            
            // Обновляем данные
            this.loadData();
            
            // Показываем сообщение об успехе
            this.showSuccessMessage(isEditMode);
            
        } catch (error) {
            this.showNotification("Ошибка при отправке данных: " + error.message, "error");
            this.elements.submitBtn.disabled = false;
            this.elements.submitText.textContent = isEditMode ? 'Обновить заявку' : 'Отправить заявку';
        }
    }

    // Создание новой регистрации
    async createRegistration(formData) {
        // Генерируем ID
        this.data.lastId++;
        const teamId = this.data.lastId;
        
        const teamData = {
            id: teamId,
            ...formData,
            status: this.data.settings.requireApproval ? 'pending' : 'confirmed',
            registrationDate: new Date().toLocaleDateString('ru-RU'),
            registrationTime: new Date().toISOString(),
            ip: await this.getUserIP(),
            syncedWithSheets: false,
            syncFailed: false,
            syncAttempts: 0
        };
        
        // Добавляем команду в локальное хранилище
        this.data.teams.push(teamData);
        this.saveData();
        
        // Сохраняем информацию о регистрации пользователя
        const userRegistration = {
            teamId: teamId,
            registrationDate: new Date().toISOString(),
            localData: true
        };
        localStorage.setItem(this.userRegistrationKey, JSON.stringify(userRegistration));
        
        // Пытаемся отправить в Google Sheets
        if (this.googleScriptURL && this.data.settings.enableSync) {
            try {
                await this.sendToGoogleSheets(teamData, 'register');
                teamData.syncedWithSheets = true;
                
                // Обновляем данные
                const teamIndex = this.data.teams.findIndex(t => t.id === teamId);
                if (teamIndex !== -1) {
                    this.data.teams[teamIndex] = teamData;
                    this.saveData();
                }
            } catch (error) {
                console.warn('Ошибка отправки в Google Sheets:', error);
                teamData.syncFailed = true;
                
                // Добавляем в очередь на синхронизацию
                this.addToSyncQueue(teamData);
                
                // Обновляем данные
                const teamIndex = this.data.teams.findIndex(t => t.id === teamId);
                if (teamIndex !== -1) {
                    this.data.teams[teamIndex] = teamData;
                    this.saveData();
                }
            }
        }
        
        this.showNotification("Команда успешно зарегистрирована!", "success");
        return teamId;
    }

    // Обновление регистрации
    async updateRegistration(formData) {
        const teamId = parseInt(this.elements.registrationId.value);
        const teamIndex = this.data.teams.findIndex(t => t.id === teamId);
        
        if (teamIndex === -1) {
            throw new Error("Команда не найдена");
        }
        
        // Сохраняем старые данные для синхронизации
        const oldTeam = { ...this.data.teams[teamIndex] };
        
        // Обновляем данные команды
        this.data.teams[teamIndex] = {
            ...oldTeam,
            ...formData,
            status: 'pending', // Сбрасываем статус при редактировании
            syncedWithSheets: false,
            syncFailed: false,
            syncAttempts: 0
        };
        
        this.saveData();
        
        // Пытаемся отправить обновление в Google Sheets
        if (this.googleScriptURL && this.data.settings.enableSync) {
            try {
                await this.sendToGoogleSheets(this.data.teams[teamIndex], 'update');
                this.data.teams[teamIndex].syncedWithSheets = true;
                this.saveData();
            } catch (error) {
                console.warn('Ошибка обновления в Google Sheets:', error);
                this.data.teams[teamIndex].syncFailed = true;
                this.addToSyncQueue(this.data.teams[teamIndex]);
                this.saveData();
            }
        }
        
        this.showNotification("Данные команды обновлены", "success");
    }

    // Валидация формы
    validateForm() {
        let isValid = true;
        
        // Очищаем предыдущие ошибки
        document.querySelectorAll('.error-text').forEach(el => {
            el.style.display = 'none';
            el.textContent = '';
        });
        document.querySelectorAll('.input-field').forEach(el => {
            el.classList.remove('error');
        });
        
        // Проверка названия команды
        const teamName = this.elements.teamName.value.trim();
        if (!teamName || teamName.length < 3) {
            this.showError(this.elements.teamName, 'Название команды должно быть не менее 3 символов');
            isValid = false;
        }
        
        // Проверка тега команды
        const teamTag = this.elements.teamTag.value.trim().toUpperCase();
        if (!teamTag || teamTag.length < 2 || teamTag.length > 6) {
            this.showError(this.elements.teamTag, 'Тег команды должен быть от 2 до 6 символов');
            isValid = false;
        }
        
        // Проверка уникальности тега
        const teamId = this.elements.registrationId.value;
        const existingTeam = this.data.teams.find(t => 
            t.tag.toUpperCase() === teamTag && t.id.toString() !== teamId
        );
        if (existingTeam) {
            this.showError(this.elements.teamTag, 'Команда с таким тегом уже зарегистрирована');
            isValid = false;
        }
        
        // Проверка основных игроков
        for (let i = 1; i <= 5; i++) {
            const playerId = document.querySelector(`.main-id[data-index="${i}"]`).value.trim();
            const playerNick = document.querySelector(`.main-nickname[data-index="${i}"]`).value.trim();
            
            if (!playerId) {
                this.showError(`playerIdError${i}`, 'Введите игровое ID');
                document.querySelector(`.main-id[data-index="${i}"]`).classList.add('error');
                isValid = false;
            }
            
            if (!playerNick) {
                this.showError(`playerNickError${i}`, 'Введите никнейм');
                document.querySelector(`.main-nickname[data-index="${i}"]`).classList.add('error');
                isValid = false;
            }
        }
        
        // Проверка запасного игрока
        const reserveId = document.querySelector('.reserve-id').value.trim();
        const reserveNick = document.querySelector('.reserve-nickname').value.trim();
        
        if (!reserveId) {
            this.showError('reserve-id', 'Введите ID запасного игрока', '.reserve-id');
            isValid = false;
        }
        
        if (!reserveNick) {
            this.showError('reserve-nickname', 'Введите никнейм запасного игрока', '.reserve-nickname');
            isValid = false;
        }
        
        // Проверка контактов
        const telegram = this.elements.telegram.value.trim();
        const vk = this.elements.vk.value.trim();
        
        if (!telegram && !vk) {
            this.showError(this.elements.telegram, 'Укажите хотя бы один способ связи (Telegram или ВКонтакте)');
            this.showError(this.elements.vk, 'Укажите хотя бы один способ связи (Telegram или ВКонтакте)');
            isValid = false;
        }
        
        return isValid;
    }

    // Показать ошибку
    showError(fieldId, message, selector = null) {
        const element = selector ? 
            document.querySelector(selector) : 
            document.getElementById(fieldId);
        
        if (element) {
            element.classList.add('error');
            const errorElement = element.nextElementSibling?.classList?.contains('error-text') ? 
                element.nextElementSibling : 
                document.getElementById(`${fieldId}Error`) || 
                document.querySelector(`[data-error="${fieldId}"]`);
            
            if (errorElement && errorElement.classList.contains('error-text')) {
                errorElement.textContent = message;
                errorElement.style.display = 'block';
            }
        }
    }

    // Очистить ошибку
    clearError(element) {
        element.classList.remove('error');
        const errorElement = element.nextElementSibling?.classList?.contains('error-text') ? 
            element.nextElementSibling : null;
        
        if (errorElement) {
            errorElement.style.display = 'none';
            errorElement.textContent = '';
        }
    }

    // Сбор данных формы
    collectFormData() {
        const teamName = this.elements.teamName.value.trim();
        const teamTag = this.elements.teamTag.value.trim().toUpperCase();
        const telegram = this.elements.telegram.value.trim();
        const vk = this.elements.vk.value.trim();
        const email = this.elements.email.value.trim();
        
        // Собираем данных об основных игроках
        const players = [];
        const mainIds = document.querySelectorAll('.main-id');
        const mainNicks = document.querySelectorAll('.main-nickname');
        
        for (let i = 0; i < mainIds.length; i++) {
            players.push({
                id: mainIds[i].value.trim(),
                nickname: mainNicks[i].value.trim(),
                position: i + 1
            });
        }
        
        // Данные о запасном игроке
        const reservePlayer = {
            id: document.querySelector('.reserve-id').value.trim(),
            nickname: document.querySelector('.reserve-nickname').value.trim()
        };
        
        return {
            name: teamName,
            tag: teamTag,
            players: players,
            reservePlayer: reservePlayer,
            contacts: {
                telegram,
                vk,
                email
            }
        };
    }

    // Показать сообщение об успехе
    showSuccessMessage(isEditMode = false) {
        const teamId = this.elements.registrationId.value || this.data.lastId;
        
        this.elements.registrationIdDisplay.textContent = `ASTRA-${teamId.toString().padStart(4, '0')}`;
        
        if (isEditMode) {
            this.elements.successMessageText.textContent = "Данные вашей команды успешно обновлены. Организаторы проверят изменения и свяжутся с вами.";
            this.elements.successTitle.textContent = "Данные обновлены!";
        }
        
        this.elements.registrationForm.reset();
        this.elements.successMessage.classList.add('active');
        document.getElementById('register-tab').classList.remove('active');
        
        // Сбрасываем кнопку отправки
        this.elements.submitBtn.disabled = false;
        this.elements.submitText.textContent = isEditMode ? 'Обновить заявку' : 'Отправить заявку';
        
        // Сбрасываем скрытое поле ID
        this.elements.registrationId.value = '';
    }

    // ===== GOOGLE SHEETS API INTEGRATION =====

    // Основная функция отправки в Google Sheets
    async sendToGoogleSheets(teamData, action = 'register') {
        if (!this.googleScriptURL) {
            throw new Error('Google Sheets URL не настроен');
        }
        
        if (!this.isOnline) {
            throw new Error('Нет подключения к интернету');
        }
        
        const payload = {
            action: action,
            data: teamData,
            timestamp: new Date().toISOString(),
            source: 'astra-tournament',
            version: '1.0'
        };
        
        // Используем FormData для лучшей совместимости
        const formData = new URLSearchParams();
        for (const [key, value] of Object.entries(payload)) {
            formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
        }
        
        try {
            // Используем fetch с no-cors для работы с Google Apps Script
            const response = await fetch(this.googleScriptURL, {
                method: 'POST',
                mode: 'no-cors', // Важно для Google Apps Script
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                },
                body: formData.toString()
            });
            
            // В режиме no-cors мы не можем проверить статус ответа
            // Но если нет ошибки сети - считаем успешным
            return { success: true };
            
        } catch (error) {
            console.error('Ошибка отправки в Google Sheets:', error);
            throw new Error(`Не удалось отправить данные: ${error.message}`);
        }
    }

    // Добавление в очередь синхронизации
    addToSyncQueue(teamData) {
        const syncItem = {
            teamId: teamData.id,
            teamName: teamData.name,
            action: teamData.syncedWithSheets ? 'update' : 'register',
            data: teamData,
            attempts: 0,
            lastAttempt: null,
            addedAt: new Date().toISOString()
        };
        
        this.syncQueue.push(syncItem);
        this.saveSyncQueue();
        
        // Показываем уведомление о добавлении в очередь
        if (this.elements.syncStatusCard) {
            this.elements.syncStatusCard.style.display = 'block';
        }
    }

    // Функция синхронизации очереди
    async syncQueueWithSheets() {
        if (!this.googleScriptURL || !this.data.settings.enableSync || !this.isOnline) {
            return;
        }
        
        if (this.syncQueue.length === 0) {
            return;
        }
        
        console.log(`Синхронизация ${this.syncQueue.length} элементов с Google Sheets...`);
        
        // Обновляем статус синхронизации
        this.updateSyncStatus('syncing');
        
        const failedItems = [];
        
        for (const item of this.syncQueue) {
            try {
                item.attempts++;
                item.lastAttempt = new Date().toISOString();
                
                await this.sendToGoogleSheets(item.data, item.action);
                
                // Отмечаем как синхронизированное в основном массиве
                const teamIndex = this.data.teams.findIndex(t => t.id === item.teamId);
                if (teamIndex !== -1) {
                    this.data.teams[teamIndex].syncedWithSheets = true;
                    this.data.teams[teamIndex].syncFailed = false;
                }
                
                this.showNotification(`Команда "${item.teamName}" синхронизирована с Google Sheets`, 'success');
                
            } catch (error) {
                console.error(`Ошибка синхронизации команды ${item.teamName}:`, error);
                item.syncFailed = true;
                
                // Если было больше 3 попыток, удаляем из очереди
                if (item.attempts >= 3) {
                    console.warn(`Превышено количество попыток для команды ${item.teamName}`);
                    
                    // Помечаем в основном массиве
                    const teamIndex = this.data.teams.findIndex(t => t.id === item.teamId);
                    if (teamIndex !== -1) {
                        this.data.teams[teamIndex].syncFailed = true;
                    }
                } else {
                    failedItems.push(item);
                }
            }
            
            // Задержка между запросами
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Обновляем очередь
        this.syncQueue = failedItems;
        this.saveSyncQueue();
        
        // Сохраняем обновленные данные команд
        this.saveData();
        
        // Обновляем UI
        this.updateUI();
        this.updateSyncStatus(this.syncQueue.length > 0 ? 'partial' : 'success');
        
        if (this.syncQueue.length === 0) {
            this.showNotification('Все данные синхронизированы с Google Sheets', 'success');
        }
    }

    // Обновление статуса синхронизации
    updateSyncStatus(status = 'checking') {
        if (!this.elements.syncStatusCard) return;
        
        this.elements.syncStatusCard.style.display = 'block';
        
        const statusConfig = {
            checking: {
                icon: 'sync-alt',
                iconClass: 'sync-pending',
                text: 'Проверка подключения...',
                color: 'warning'
            },
            offline: {
                icon: 'wifi-slash',
                iconClass: 'sync-error',
                text: 'Офлайн режим',
                color: 'danger',
                info: 'Данные сохраняются локально. Синхронизация произойдет при подключении к интернету.'
            },
            no_config: {
                icon: 'cog',
                iconClass: 'sync-error',
                text: 'Google Sheets не настроен',
                color: 'warning',
                info: 'Для синхронизации с Google Sheets настройте подключение в админ-панели.'
            },
            success: {
                icon: 'check-circle',
                iconClass: 'sync-ok',
                text: 'Синхронизировано',
                color: 'success',
                info: 'Все данные синхронизированы с Google Sheets.'
            },
            partial: {
                icon: 'exclamation-triangle',
                iconClass: 'sync-pending',
                text: 'Частично синхронизировано',
                color: 'warning',
                info: `${this.syncQueue.length} элементов ожидают синхронизации.`
            },
            syncing: {
                icon: 'sync-alt',
                iconClass: 'sync-pending spinning',
                text: 'Синхронизация...',
                color: 'warning',
                info: `Синхронизация ${this.syncQueue.length} элементов с Google Sheets.`
            },
            error: {
                icon: 'times-circle',
                iconClass: 'sync-error',
                text: 'Ошибка синхронизации',
                color: 'danger',
                info: 'Не удалось подключиться к Google Sheets. Проверьте настройки.'
            }
        };
        
        const config = statusConfig[status] || statusConfig.error;
        
        // Обновляем иконку
        const icon = this.elements.sheetsSyncIcon;
        icon.className = `fas fa-${config.icon} ${config.iconClass}`;
        
        // Обновляем текст
        this.elements.sheetsStatus.innerHTML = `<strong style="color: var(--${config.color})">${config.text}</strong>`;
        
        // Обновляем информацию
        if (config.info) {
            this.elements.syncInfo.textContent = config.info;
        }
        
        // Автоматически определяем статус если не указан
        if (status === 'checking') {
            if (!this.googleScriptURL) {
                this.updateSyncStatus('no_config');
            } else if (!this.isOnline) {
                this.updateSyncStatus('offline');
            } else if (this.syncQueue.length > 0) {
                this.updateSyncStatus('partial');
            } else {
                // Проверяем есть ли несинхронизированные команды
                const unsyncedTeams = this.data.teams.filter(team => !team.syncedWithSheets);
                if (unsyncedTeams.length > 0) {
                    // Добавляем в очередь
                    unsyncedTeams.forEach(team => {
                        if (!this.syncQueue.find(item => item.teamId === team.id)) {
                            this.addToSyncQueue(team);
                        }
                    });
                    this.updateSyncStatus('partial');
                } else {
                    this.updateSyncStatus('success');
                }
            }
        }
    }

    // Запуск службы синхронизации
    startSyncService() {
        // Первая проверка
        this.updateSyncStatus();
        
        // Синхронизация при загрузке если есть очередь
        if (this.syncQueue.length > 0 && this.isOnline) {
            setTimeout(() => this.syncQueueWithSheets(), 3000);
        }
        
        // Периодическая синхронизация каждые 5 минут
        setInterval(() => {
            if (this.isOnline && this.googleScriptURL && this.data.settings.enableSync) {
                this.syncQueueWithSheets();
            }
        }, 5 * 60 * 1000);
        
        // Синхронизация при восстановлении подключения
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateSyncStatus();
            
            if (this.googleScriptURL && this.data.settings.enableSync) {
                setTimeout(() => this.syncQueueWithSheets(), 2000);
            }
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateSyncStatus('offline');
        });
    }

    // Настройка проверки онлайн-статуса
    setupOnlineCheck() {
        this.isOnline = navigator.onLine;
        
        // Показываем уведомление при изменении статуса
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showNotification('Подключение к интернету восстановлено', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showNotification('Потеряно подключение к интернету. Данные сохраняются локально.', 'warning');
        });
    }

    // Получение IP пользователя
    async getUserIP() {
        try {
            // Пробуем несколько сервисов
            const services = [
                'https://api.ipify.org?format=json',
                'https://api64.ipify.org?format=json',
                'https://ipinfo.io/json'
            ];
            
            for (const service of services) {
                try {
                    const response = await fetch(service, { timeout: 3000 });
                    if (response.ok) {
                        const data = await response.json();
                        return data.ip || data.ip_address || 'unknown';
                    }
                } catch {
                    continue;
                }
            }
            
            return 'unknown';
        } catch {
            return 'unknown';
        }
    }

    // Показать уведомление
    showNotification(message, type = "success") {
        this.elements.notification.textContent = message;
        this.elements.notification.className = `notification ${type}`;
        this.elements.notification.style.display = 'block';
        
        setTimeout(() => {
            this.elements.notification.style.display = 'none';
        }, 5000);
    }

    // Вспомогательные методы
    getStatusText(status) {
        const statusMap = {
            'registration': 'Регистрация',
            'ongoing': 'Идет турнир',
            'finished': 'Завершен',
            'pending': 'Ожидает',
            'confirmed': 'Подтверждена',
            'rejected': 'Отклонена',
            'closed': 'Закрыта'
        };
        return statusMap[status] || status;
    }

    getStatusBadgeText(status) {
        const badgeMap = {
            'registration': 'ОТКРЫТА',
            'ongoing': 'В ПРОЦЕССЕ',
            'finished': 'ЗАВЕРШЕН',
            'closed': 'ЗАКРЫТА'
        };
        return badgeMap[status] || status.toUpperCase();
    }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AstraTournamentApp();
    
    // Глобальные функции для отладки
    window.debugApp = {
        getData: () => window.app.data,
        getTeams: () => window.app.data.teams,
        getSyncQueue: () => window.app.syncQueue,
        forceSync: () => window.app.syncQueueWithSheets(),
        clearData: () => {
            if (confirm('Очистить все данные?')) {
                localStorage.clear();
                location.reload();
            }
        },
        testSheets: async () => {
            if (!window.app.googleScriptURL) {
                alert('Google Sheets URL не настроен');
                return;
            }
            
            try {
                const testData = {
                    id: 999,
                    name: 'Test Team',
                    tag: 'TEST',
                    players: [{ id: 'TEST1', nickname: 'Test Player 1', position: 1 }],
                    reservePlayer: { id: 'TEST2', nickname: 'Test Reserve' },
                    contacts: { telegram: '@test', vk: '', email: 'test@example.com' },
                    status: 'pending',
                    registrationDate: new Date().toLocaleDateString('ru-RU')
                };
                
                const result = await window.app.sendToGoogleSheets(testData, 'register');
                alert('Тест успешен! Проверьте Google Sheets.');
            } catch (error) {
                alert('Тест не удался: ' + error.message);
            }
        }
    };
});
