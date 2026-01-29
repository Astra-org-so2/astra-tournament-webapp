// Главный класс приложения
class AstraTournamentApp {
    constructor() {
        this.dataKey = 'astraTournamentData';
        this.settingsKey = 'astraTournamentSettings';
        this.userRegistrationKey = 'userRegistration';
        this.init();
    }

    init() {
        // Инициализация данных
        this.initializeData();
        
        // Настройка DOM элементов
        this.setupDOM();
        
        // Загрузка данных
        this.loadData();
        
        // Настройка обработчиков событий
        this.setupEventListeners();
        
        // Создание полей для игроков
        this.createPlayerFields();
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
                    requireApproval: true
                }
            };
            localStorage.setItem(this.dataKey, JSON.stringify(initialData));
        }
        
        if (!localStorage.getItem(this.settingsKey)) {
            const settings = {
                adminPassword: "astra2023",
                googleSheetsUrl: "",
                contactEmail: "astra.org@example.com"
            };
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
        }
    }

    // Загрузка данных
    loadData() {
        this.data = JSON.parse(localStorage.getItem(this.dataKey));
        this.settings = JSON.parse(localStorage.getItem(this.settingsKey));
        this.userRegistration = JSON.parse(localStorage.getItem(this.userRegistrationKey));
        
        this.updateUI();
    }

    // Сохранение данных
    saveData() {
        localStorage.setItem(this.dataKey, JSON.stringify(this.data));
    }

    // Настройка DOM элементов
    setupDOM() {
        this.elements = {
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
            tournamentStatus: document.getElementById('tournamentStatus'),
            statusBadge: document.getElementById('statusBadge'),
            startDate: document.getElementById('startDate'),
            startDateInfo: document.getElementById('startDateInfo'),
            regEndDate: document.getElementById('regEndDate'),
            tournamentDescription: document.getElementById('tournamentDescription'),
            tournamentFormat: document.getElementById('tournamentFormat'),
            prizePool: document.getElementById('prizePool'),
            teamSearch: document.getElementById('teamSearch'),
            registrationIdDisplay: document.getElementById('registrationIdDisplay'),
            successMessageText: document.getElementById('successMessageText')
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
        
        document.getElementById('registrationId').value = team.id;
        document.getElementById('teamName').value = team.name;
        document.getElementById('teamTag').value = team.tag;
        document.getElementById('telegram').value = team.contacts.telegram || '';
        document.getElementById('vk').value = team.contacts.vk || '';
        document.getElementById('email').value = team.contacts.email || '';
        
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
        const isEditMode = !!document.getElementById('registrationId').value;
        
        // Показываем индикатор загрузки
        this.elements.submitBtn.disabled = true;
        this.elements.submitText.innerHTML = '<div class="loading"></div> Отправка...';
        
        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 1500));
        
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
            registrationTime: new Date().toISOString()
        };
        
        // Добавляем команду
        this.data.teams.push(teamData);
        this.saveData();
        
        // Сохраняем информацию о регистрации пользователя
        const userRegistration = {
            teamId: teamId,
            registrationDate: new Date().toISOString(),
            ip: this.getUserIP() // В реальном приложении нужно получать с сервера
        };
        localStorage.setItem(this.userRegistrationKey, JSON.stringify(userRegistration));
        
        // Отправка в Google Sheets (если настроено)
        await this.sendToGoogleSheets(teamData);
        
        this.showNotification("Команда успешно зарегистрирована!", "success");
    }

    // Обновление регистрации
    async updateRegistration(formData) {
        const teamId = parseInt(document.getElementById('registrationId').value);
        const teamIndex = this.data.teams.findIndex(t => t.id === teamId);
        
        if (teamIndex === -1) {
            throw new Error("Команда не найдена");
        }
        
        // Обновляем данные команды
        this.data.teams[teamIndex] = {
            ...this.data.teams[teamIndex],
            ...formData,
            status: 'pending' // Сбрасываем статус при редактировании
        };
        
        this.saveData();
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
        const teamName = document.getElementById('teamName').value.trim();
        if (!teamName || teamName.length < 3) {
            this.showError('teamName', 'Название команды должно быть не менее 3 символов');
            isValid = false;
        }
        
        // Проверка тега команды
        const teamTag = document.getElementById('teamTag').value.trim().toUpperCase();
        if (!teamTag || teamTag.length < 2 || teamTag.length > 6) {
            this.showError('teamTag', 'Тег команды должен быть от 2 до 6 символов');
            isValid = false;
        }
        
        // Проверка уникальности тега
        const teamId = document.getElementById('registrationId').value;
        const existingTeam = this.data.teams.find(t => 
            t.tag.toUpperCase() === teamTag && t.id.toString() !== teamId
        );
        if (existingTeam) {
            this.showError('teamTag', 'Команда с таким тегом уже зарегистрирована');
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
        const telegram = document.getElementById('telegram').value.trim();
        const vk = document.getElementById('vk').value.trim();
        
        if (!telegram && !vk) {
            this.showError('telegram', 'Укажите хотя бы один способ связи (Telegram или ВКонтакте)');
            this.showError('vk', 'Укажите хотя бы один способ связи (Telegram или ВКонтакте)');
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

    // Сбор данных формы
    collectFormData() {
        const teamName = document.getElementById('teamName').value.trim();
        const teamTag = document.getElementById('teamTag').value.trim().toUpperCase();
        const telegram = document.getElementById('telegram').value.trim();
        const vk = document.getElementById('vk').value.trim();
        const email = document.getElementById('email').value.trim();
        
        // Собираем данных об основных игроках
        const players = [];
        for (let i = 1; i <= 5; i++) {
            const idInput = document.querySelector(`.main-id[data-index="${i}"]`);
            const nickInput = document.querySelector(`.main-nickname[data-index="${i}"]`);
            
            if (idInput && nickInput) {
                players.push({
                    id: idInput.value.trim(),
                    nickname: nickInput.value.trim(),
                    position: i
                });
            }
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
        const teamId = document.getElementById('registrationId').value || this.data.lastId;
        
        this.elements.registrationIdDisplay.textContent = `ASTRA-${teamId.toString().padStart(4, '0')}`;
        
        if (isEditMode) {
            this.elements.successMessageText.textContent = "Данные вашей команды успешно обновлены. Организаторы проверят изменения и свяжутся с вами.";
            this.elements.successTitle.textContent = "Данные обновлены!";
        }
        
        this.elements.registrationForm.reset();
        this.elements.successMessage.classList.add('active');
        this.elements.registerTab.classList.remove('active');
        
        // Сбрасываем кнопку отправки
        this.elements.submitBtn.disabled = false;
        this.elements.submitText.textContent = isEditMode ? 'Обновить заявку' : 'Отправить заявку';
        
        // Сбрасываем скрытое поле ID
        document.getElementById('registrationId').value = '';
    }

    // Отправка данных в Google Sheets
    async sendToGoogleSheets(teamData) {
        const sheetsUrl = this.settings.googleSheetsUrl;
        if (!sheetsUrl) return;
        
        try {
            const response = await fetch(sheetsUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(teamData)
            });
            
            if (!response.ok) {
                throw new Error('Ошибка отправки в Google Sheets');
            }
            
            console.log('Данные отправлены в Google Sheets');
        } catch (error) {
            console.error('Ошибка при отправке в Google Sheets:', error);
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

    getUserIP() {
        // В реальном приложении IP должен получаться с сервера
        return 'local-' + Math.random().toString(36).substr(2, 9);
    }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AstraTournamentApp();
});
