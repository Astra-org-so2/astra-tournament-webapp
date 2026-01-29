// Класс админ-панели
class AstraTournamentAdmin {
    constructor() {
        this.dataKey = 'astraTournamentData';
        this.settingsKey = 'astraTournamentSettings';
        this.backupsKey = 'astraTournamentBackups';
        this.adminSessionKey = 'astraAdminSession';
        this.currentPage = 1;
        this.teamsPerPage = 10;
        this.init();
    }

    init() {
        // Проверяем авторизацию
        this.checkAuth();
        
        // Инициализация данных
        this.initializeBackups();
        
        // Настройка DOM элементов
        this.setupDOM();
        
        // Загрузка данных
        this.loadData();
        
        // Настройка обработчиков событий
        this.setupEventListeners();
        
        // Обновление интерфейса
        this.updateUI();
    }

    // Инициализация системы бэкапов
    initializeBackups() {
        if (!localStorage.getItem(this.backupsKey)) {
            localStorage.setItem(this.backupsKey, JSON.stringify([]));
        }
    }

    // Проверка авторизации
    checkAuth() {
        const session = localStorage.getItem(this.adminSessionKey);
        if (session && JSON.parse(session).expires > Date.now()) {
            this.isAuthenticated = true;
        } else {
            this.isAuthenticated = false;
            localStorage.removeItem(this.adminSessionKey);
        }
        
        this.showAuthScreen();
    }

    // Показать экран авторизации
    showAuthScreen() {
        const loginPanel = document.getElementById('loginPanel');
        const adminContent = document.getElementById('adminContent');
        const adminUser = document.getElementById('adminUser');
        
        if (this.isAuthenticated) {
            loginPanel.style.display = 'none';
            adminContent.style.display = 'flex';
            adminUser.style.display = 'flex';
        } else {
            loginPanel.style.display = 'flex';
            adminContent.style.display = 'none';
            adminUser.style.display = 'none';
        }
    }

    // Загрузка данных
    loadData() {
        this.data = JSON.parse(localStorage.getItem(this.dataKey)) || { teams: [], tournament: {}, settings: {} };
        this.settings = JSON.parse(localStorage.getItem(this.settingsKey)) || {};
        this.backups = JSON.parse(localStorage.getItem(this.backupsKey)) || [];
    }

    // Сохранение данных
    saveData() {
        localStorage.setItem(this.dataKey, JSON.stringify(this.data));
        localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
    }

    // Настройка DOM элементов
    setupDOM() {
        this.elements = {
            // Авторизация
            adminPassword: document.getElementById('adminPassword'),
            loginBtn: document.getElementById('loginBtn'),
            passwordError: document.getElementById('passwordError'),
            logoutBtn: document.getElementById('logoutBtn'),
            
            // Дашборд
            statTotalTeams: document.getElementById('statTotalTeams'),
            statConfirmedTeams: document.getElementById('statConfirmedTeams'),
            statPendingTeams: document.getElementById('statPendingTeams'),
            statRejectedTeams: document.getElementById('statRejectedTeams'),
            dashboardTotalTeams: document.getElementById('dashboardTotalTeams'),
            dashboardConfirmedTeams: document.getElementById('dashboardConfirmedTeams'),
            dashboardPendingTeams: document.getElementById('dashboardPendingTeams'),
            dashboardRejectedTeams: document.getElementById('dashboardRejectedTeams'),
            recentActivity: document.getElementById('recentActivity'),
            openRegistrationBtn: document.getElementById('openRegistrationBtn'),
            closeRegistrationBtn: document.getElementById('closeRegistrationBtn'),
            exportAllBtn: document.getElementById('exportAllBtn'),
            clearDataBtn: document.getElementById('clearDataBtn'),
            
            // Команды
            teamSearchAdmin: document.getElementById('teamSearchAdmin'),
            teamsTableBody: document.getElementById('teamsTableBody'),
            teamsPagination: document.getElementById('teamsPagination'),
            
            // Турнир
            tournamentSettingsForm: document.getElementById('tournamentSettingsForm'),
            tournamentName: document.getElementById('tournamentName'),
            tournamentStatus: document.getElementById('tournamentStatus'),
            tournamentStartDate: document.getElementById('tournamentStartDate'),
            tournamentRegEndDate: document.getElementById('tournamentRegEndDate'),
            tournamentFormat: document.getElementById('tournamentFormat'),
            tournamentPrizePool: document.getElementById('tournamentPrizePool'),
            tournamentDescription: document.getElementById('tournamentDescription'),
            tournamentMaxTeams: document.getElementById('tournamentMaxTeams'),
            tournamentRequireApproval: document.getElementById('tournamentRequireApproval'),
            
            // Настройки
            systemSettingsForm: document.getElementById('systemSettingsForm'),
            adminPasswordSetting: document.getElementById('adminPasswordSetting'),
            adminEmail: document.getElementById('adminEmail'),
            googleSheetsUrl: document.getElementById('googleSheetsUrl'),
            enableEmailNotifications: document.getElementById('enableEmailNotifications'),
            enableAutoBackup: document.getElementById('enableAutoBackup'),
            backupDataBtn: document.getElementById('backupDataBtn'),
            restoreBackupBtn: document.getElementById('restoreBackupBtn'),
            resetDataBtn: document.getElementById('resetDataBtn'),
            
            // Экспорт
            exportTeamsCsvBtn: document.getElementById('exportTeamsCsvBtn'),
            exportAllDataCsvBtn: document.getElementById('exportAllDataCsvBtn'),
            exportJsonBtn: document.getElementById('exportJsonBtn'),
            printTeamsBtn: document.getElementById('printTeamsBtn'),
            printConfirmedBtn: document.getElementById('printConfirmedBtn'),
            exportDataType: document.getElementById('exportDataType'),
            previewDataBtn: document.getElementById('previewDataBtn'),
            dataPreview: document.getElementById('dataPreview'),
            
            // Модальные окна
            teamDetailsModal: document.getElementById('teamDetailsModal'),
            editTeamModal: document.getElementById('editTeamModal'),
            backupModal: document.getElementById('backupModal'),
            teamDetailsContent: document.getElementById('teamDetailsContent'),
            editTeamForm: document.getElementById('editTeamForm'),
            backupList: document.getElementById('backupList'),
            
            // Уведомления
            adminNotification: document.getElementById('adminNotification')
        };
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Авторизация
        this.elements.loginBtn.addEventListener('click', () => this.handleLogin());
        this.elements.logoutBtn.addEventListener('click', () => this.handleLogout());
        
        // Меню
        document.querySelectorAll('.menu-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.switchSection(section);
            });
        });
        
        // Дашборд
        this.elements.openRegistrationBtn.addEventListener('click', () => this.openRegistration());
        this.elements.closeRegistrationBtn.addEventListener('click', () => this.closeRegistration());
        this.elements.exportAllBtn.addEventListener('click', () => this.exportAllData());
        this.elements.clearDataBtn.addEventListener('click', () => this.clearAllData());
        
        // Команды
        this.elements.teamSearchAdmin.addEventListener('input', (e) => {
            this.currentPage = 1;
            this.renderTeamsTable();
        });
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentPage = 1;
                this.renderTeamsTable();
            });
        });
        
        // Формы
        this.elements.tournamentSettingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTournamentSettings();
        });
        
        this.elements.systemSettingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSystemSettings();
        });
        
        // Экспорт
        this.elements.exportTeamsCsvBtn.addEventListener('click', () => this.exportTeamsCSV());
        this.elements.exportAllDataCsvBtn.addEventListener('click', () => this.exportAllDataCSV());
        this.elements.exportJsonBtn.addEventListener('click', () => this.exportJSON());
        this.elements.printTeamsBtn.addEventListener('click', () => this.printTeams());
        this.elements.printConfirmedBtn.addEventListener('click', () => this.printConfirmedTeams());
        this.elements.previewDataBtn.addEventListener('click', () => this.previewData());
        
        // Настройки
        this.elements.backupDataBtn.addEventListener('click', () => this.showBackupModal());
        this.elements.restoreBackupBtn.addEventListener('click', () => this.showRestoreModal());
        this.elements.resetDataBtn.addEventListener('click', () => this.resetAllData());
        
        // Модальные окна
        document.getElementById('closeTeamModal').addEventListener('click', () => {
            this.elements.teamDetailsModal.classList.remove('active');
        });
        
        document.getElementById('closeEditModal').addEventListener('click', () => {
            this.elements.editTeamModal.classList.remove('active');
        });
        
        document.getElementById('closeBackupModal').addEventListener('click', () => {
            this.elements.backupModal.classList.remove('active');
        });
        
        document.getElementById('createBackupBtn').addEventListener('click', () => this.createBackup());
        
        // Закрытие модальных окон по клику вне области
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    // Обновление интерфейса
    updateUI() {
        if (!this.isAuthenticated) return;
        
        // Обновление статистики
        this.updateStatistics();
        
        // Обновление дашборда
        this.updateDashboard();
        
        // Загрузка последних активностей
        this.loadRecentActivity();
        
        // Заполнение форм текущими данными
        this.fillTournamentSettings();
        this.fillSystemSettings();
        
        // Отрисовка таблицы команд
        this.renderTeamsTable();
    }

    // Обновление статистики
    updateStatistics() {
        const total = this.data.teams.length;
        const confirmed = this.data.teams.filter(t => t.status === 'confirmed').length;
        const pending = this.data.teams.filter(t => t.status === 'pending').length;
        const rejected = this.data.teams.filter(t => t.status === 'rejected').length;
        
        this.elements.statTotalTeams.textContent = total;
        this.elements.statConfirmedTeams.textContent = confirmed;
        this.elements.statPendingTeams.textContent = pending;
        this.elements.statRejectedTeams.textContent = rejected;
        
        this.elements.dashboardTotalTeams.textContent = total;
        this.elements.dashboardConfirmedTeams.textContent = confirmed;
        this.elements.dashboardPendingTeams.textContent = pending;
        this.elements.dashboardRejectedTeams.textContent = rejected;
    }

    // Обновление дашборда
    updateDashboard() {
        // Обновление кнопок регистрации
        const isRegistrationOpen = this.data.tournament.status === 'registration' && 
                                  this.data.settings.registrationOpen;
        
        if (isRegistrationOpen) {
            this.elements.openRegistrationBtn.style.display = 'none';
            this.elements.closeRegistrationBtn.style.display = 'block';
        } else {
            this.elements.openRegistrationBtn.style.display = 'block';
            this.elements.closeRegistrationBtn.style.display = 'none';
        }
    }

    // Загрузка последних активностей
    loadRecentActivity() {
        const recentTeams = [...this.data.teams]
            .sort((a, b) => new Date(b.registrationTime || 0) - new Date(a.registrationTime || 0))
            .slice(0, 5);
        
        this.elements.recentActivity.innerHTML = '';
        
        if (recentTeams.length === 0) {
            this.elements.recentActivity.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
                    <i class="fas fa-info-circle" style="font-size: 24px; margin-bottom: 10px;"></i>
                    <p>Нет последних активностей</p>
                </div>
            `;
            return;
        }
        
        recentTeams.forEach(team => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            
            let activityText = '';
            let icon = 'user-plus';
            let iconColor = 'var(--primary)';
            
            switch (team.status) {
                case 'pending':
                    activityText = 'Новая заявка на регистрацию';
                    icon = 'clock';
                    iconColor = 'var(--warning)';
                    break;
                case 'confirmed':
                    activityText = 'Команда подтверждена';
                    icon = 'check-circle';
                    iconColor = 'var(--success)';
                    break;
                case 'rejected':
                    activityText = 'Заявка отклонена';
                    icon = 'times-circle';
                    iconColor = 'var(--danger)';
                    break;
                default:
                    activityText = 'Зарегистрирована команда';
            }
            
            activityItem.innerHTML = `
                <div class="activity-icon" style="background-color: ${iconColor}20;">
                    <i class="fas fa-${icon}" style="color: ${iconColor};"></i>
                </div>
                <div class="activity-content">
                    <h4>${team.name} [${team.tag}]</h4>
                    <p>${activityText} • ${team.registrationDate}</p>
                </div>
            `;
            
            this.elements.recentActivity.appendChild(activityItem);
        });
    }

    // Отрисовка таблицы команд
    renderTeamsTable() {
        const searchQuery = this.elements.teamSearchAdmin.value.toLowerCase();
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        
        // Фильтрация команд
        let filteredTeams = this.data.teams.filter(team => {
            const matchesSearch = !searchQuery || 
                team.name.toLowerCase().includes(searchQuery) || 
                team.tag.toLowerCase().includes(searchQuery);
            
            const matchesFilter = activeFilter === 'all' || team.status === activeFilter;
            
            return matchesSearch && matchesFilter;
        });
        
        // Пагинация
        const totalPages = Math.ceil(filteredTeams.length / this.teamsPerPage);
        const startIndex = (this.currentPage - 1) * this.teamsPerPage;
        const endIndex = startIndex + this.teamsPerPage;
        const teamsToShow = filteredTeams.slice(startIndex, endIndex);
        
        // Очистка таблицы
        this.elements.teamsTableBody.innerHTML = '';
        
        if (teamsToShow.length === 0) {
            this.elements.teamsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                        <i class="fas fa-users" style="font-size: 32px; margin-bottom: 10px; opacity: 0.3;"></i>
                        <p>${searchQuery ? 'Команды не найдены' : 'Нет зарегистрированных команд'}</p>
                    </td>
                </tr>
            `;
        } else {
            teamsToShow.forEach(team => {
                const row = document.createElement('tr');
                
                let contacts = '';
                if (team.contacts.telegram) contacts += `TG: ${team.contacts.telegram}<br>`;
                if (team.contacts.vk) contacts += `VK: ${team.contacts.vk}<br>`;
                if (team.contacts.email) contacts += `Email: ${team.contacts.email}`;
                
                row.innerHTML = `
                    <td>${team.id}</td>
                    <td><strong>${team.name}</strong></td>
                    <td><span class="team-tag">${team.tag}</span></td>
                    <td><span class="status-badge ${team.status}">${this.getStatusText(team.status)}</span></td>
                    <td>${contacts}</td>
                    <td>${team.registrationDate}</td>
                    <td>
                        <div class="table-actions">
                            <button class="table-btn view-team" data-id="${team.id}" title="Просмотр">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="table-btn edit-team" data-id="${team.id}" title="Редактировать">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="table-btn delete-team" data-id="${team.id}" title="Удалить">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                
                this.elements.teamsTableBody.appendChild(row);
            });
            
            // Добавляем обработчики для кнопок действий
            this.addTeamActionHandlers();
        }
        
        // Обновление пагинации
        this.updatePagination(totalPages);
    }

    // Добавление обработчиков для кнопок действий с командами
    addTeamActionHandlers() {
        // Просмотр команды
        document.querySelectorAll('.view-team').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const teamId = parseInt(e.target.closest('button').dataset.id);
                this.showTeamDetails(teamId);
            });
        });
        
        // Редактирование команды
        document.querySelectorAll('.edit-team').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const teamId = parseInt(e.target.closest('button').dataset.id);
                this.showEditTeamModal(teamId);
            });
        });
        
        // Удаление команды
        document.querySelectorAll('.delete-team').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const teamId = parseInt(e.target.closest('button').dataset.id);
                this.deleteTeam(teamId);
            });
        });
    }

    // Обновление пагинации
    updatePagination(totalPages) {
        this.elements.teamsPagination.innerHTML = '';
        
        if (totalPages <= 1) return;
        
        // Кнопка "Назад"
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.disabled = this.currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderTeamsTable();
            }
        });
        this.elements.teamsPagination.appendChild(prevBtn);
        
        // Номера страниц
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `pagination-btn ${i === this.currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                this.currentPage = i;
                this.renderTeamsTable();
            });
            this.elements.teamsPagination.appendChild(pageBtn);
        }
        
        // Кнопка "Вперед"
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.disabled = this.currentPage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderTeamsTable();
            }
        });
        this.elements.teamsPagination.appendChild(nextBtn);
    }

    // Показать детали команды
    showTeamDetails(teamId) {
        const team = this.data.teams.find(t => t.id === teamId);
        if (!team) return;
        
        let playersHTML = '';
        team.players.forEach((player, index) => {
            playersHTML += `
                <div class="player-item">
                    <div class="player-name">${player.nickname}</div>
                    <div class="player-id">ID: ${player.id}</div>
                </div>
            `;
        });
        
        let reservePlayerHTML = '';
        if (team.reservePlayer) {
            reservePlayerHTML = `
                <div class="player-item">
                    <div class="player-name">${team.reservePlayer.nickname} (запасной)</div>
                    <div class="player-id">ID: ${team.reservePlayer.id}</div>
                </div>
            `;
        }
        
        let contactsHTML = '';
        if (team.contacts.telegram) contactsHTML += `<div><strong>Telegram:</strong> ${team.contacts.telegram}</div>`;
        if (team.contacts.vk) contactsHTML += `<div><strong>ВКонтакте:</strong> ${team.contacts.vk}</div>`;
        if (team.contacts.email) contactsHTML += `<div><strong>Email:</strong> ${team.contacts.email}</div>`;
        
        this.elements.teamDetailsContent.innerHTML = `
            <div class="team-details">
                <div class="detail-group">
                    <h4><i class="fas fa-info-circle"></i> Основная информация</h4>
                    <div class="detail-content">
                        <div class="detail-item">
                            <div class="detail-label">ID команды:</div>
                            <div class="detail-value">${team.id}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Название:</div>
                            <div class="detail-value">${team.name}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Тег:</div>
                            <div class="detail-value">${team.tag}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Статус:</div>
                            <div class="detail-value"><span class="status-badge ${team.status}">${this.getStatusText(team.status)}</span></div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Дата регистрации:</div>
                            <div class="detail-value">${team.registrationDate}</div>
                        </div>
                    </div>
                </div>
                
                <div class="detail-group">
                    <h4><i class="fas fa-gamepad"></i> Основной состав</h4>
                    <div class="players-list">
                        ${playersHTML}
                    </div>
                </div>
                
                ${reservePlayerHTML ? `
                <div class="detail-group">
                    <h4><i class="fas fa-user-plus"></i> Запасной игрок</h4>
                    <div class="players-list">
                        ${reservePlayerHTML}
                    </div>
                </div>
                ` : ''}
                
                <div class="detail-group">
                    <h4><i class="fas fa-address-book"></i> Контакты</h4>
                    <div class="detail-content">
                        ${contactsHTML}
                    </div>
                </div>
            </div>
        `;
        
        // Настройка обработчиков для кнопок в модальном окне
        document.getElementById('confirmTeamBtn').onclick = () => this.updateTeamStatus(teamId, 'confirmed');
        document.getElementById('rejectTeamBtn').onclick = () => this.updateTeamStatus(teamId, 'rejected');
        document.getElementById('deleteTeamBtn').onclick = () => this.deleteTeam(teamId);
        document.getElementById('editTeamBtn').onclick = () => {
            this.elements.teamDetailsModal.classList.remove('active');
            this.showEditTeamModal(teamId);
        };
        
        this.elements.teamDetailsModal.classList.add('active');
    }

    // Показать модальное окно редактирования команды
    showEditTeamModal(teamId) {
        const team = this.data.teams.find(t => t.id === teamId);
        if (!team) return;
        
        let playersFields = '';
        team.players.forEach((player, index) => {
            playersFields += `
                <div class="player-row">
                    <div class="player-id">
                        <label class="player-label">Игровое ID игрока ${index + 1} *</label>
                        <input type="text" class="input-field" name="playerId${index + 1}" 
                               value="${player.id}" required maxlength="20">
                    </div>
                    <div class="player-nickname">
                        <label class="player-label">Никнейм игрока ${index + 1} *</label>
                        <input type="text" class="input-field" name="playerNickname${index + 1}" 
                               value="${player.nickname}" required maxlength="20">
                    </div>
                </div>
            `;
        });
        
        this.elements.editTeamForm.innerHTML = `
            <input type="hidden" name="teamId" value="${team.id}">
            
            <div class="form-section">
                <h4 class="form-title"><i class="fas fa-flag"></i> Информация о команде</h4>
                <div class="input-group">
                    <label class="input-label">Название команды *</label>
                    <input type="text" class="input-field" name="teamName" value="${team.name}" required>
                </div>
                <div class="input-group">
                    <label class="input-label">Тег команды *</label>
                    <input type="text" class="input-field" name="teamTag" value="${team.tag}" required maxlength="6">
                </div>
                <div class="input-group">
                    <label class="input-label">Статус *</label>
                    <select class="input-field" name="teamStatus" required>
                        <option value="pending" ${team.status === 'pending' ? 'selected' : ''}>Ожидает</option>
                        <option value="confirmed" ${team.status === 'confirmed' ? 'selected' : ''}>Подтверждена</option>
                        <option value="rejected" ${team.status === 'rejected' ? 'selected' : ''}>Отклонена</option>
                    </select>
                </div>
            </div>
            
            <div class="form-section">
                <h4 class="form-title"><i class="fas fa-gamepad"></i> Основной состав (5 игроков)</h4>
                ${playersFields}
            </div>
            
            <div class="form-section">
                <h4 class="form-title"><i class="fas fa-user-plus"></i> Запасной игрок</h4>
                <div class="player-row">
                    <div class="player-id">
                        <label class="player-label">Игровое ID *</label>
                        <input type="text" class="input-field" name="reserveId" 
                               value="${team.reservePlayer?.id || ''}" required>
                    </div>
                    <div class="player-nickname">
                        <label class="player-label">Никнейм *</label>
                        <input type="text" class="input-field" name="reserveNickname" 
                               value="${team.reservePlayer?.nickname || ''}" required>
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h4 class="form-title"><i class="fas fa-address-book"></i> Контакты</h4>
                <div class="contacts-group">
                    <div class="input-group">
                        <label class="input-label">Telegram</label>
                        <input type="text" class="input-field" name="telegram" value="${team.contacts.telegram || ''}">
                    </div>
                    <div class="input-group">
                        <label class="input-label">ВКонтакте</label>
                        <input type="text" class="input-field" name="vk" value="${team.contacts.vk || ''}">
                    </div>
                </div>
                <div class="input-group">
                    <label class="input-label">Email</label>
                    <input type="email" class="input-field" name="email" value="${team.contacts.email || ''}">
                </div>
            </div>
        `;
        
        // Настройка обработчика сохранения
        document.getElementById('saveTeamBtn').onclick = () => this.saveTeamEdit();
        document.getElementById('cancelEditBtn').onclick = () => {
            this.elements.editTeamModal.classList.remove('active');
        };
        
        this.elements.editTeamModal.classList.add('active');
    }

    // Сохранение изменений команды
    saveTeamEdit() {
        const formData = new FormData(this.elements.editTeamForm);
        const teamId = parseInt(formData.get('teamId'));
        const teamIndex = this.data.teams.findIndex(t => t.id === teamId);
        
        if (teamIndex === -1) {
            this.showNotification('Команда не найдена', 'error');
            return;
        }
        
        // Собираем игроков
        const players = [];
        for (let i = 1; i <= 5; i++) {
            players.push({
                id: formData.get(`playerId${i}`),
                nickname: formData.get(`playerNickname${i}`),
                position: i
            });
        }
        
        // Обновляем данные команды
        this.data.teams[teamIndex] = {
            ...this.data.teams[teamIndex],
            name: formData.get('teamName'),
            tag: formData.get('teamTag'),
            status: formData.get('teamStatus'),
            players: players,
            reservePlayer: {
                id: formData.get('reserveId'),
                nickname: formData.get('reserveNickname')
            },
            contacts: {
                telegram: formData.get('telegram'),
                vk: formData.get('vk'),
                email: formData.get('email')
            }
        };
        
        this.saveData();
        this.updateUI();
        this.elements.editTeamModal.classList.remove('active');
        this.showNotification('Данные команды обновлены', 'success');
    }

    // Обновление статуса команды
    updateTeamStatus(teamId, status) {
        const teamIndex = this.data.teams.findIndex(t => t.id === teamId);
        
        if (teamIndex === -1) {
            this.showNotification('Команда не найдена', 'error');
            return;
        }
        
        this.data.teams[teamIndex].status = status;
        this.saveData();
        this.updateUI();
        this.elements.teamDetailsModal.classList.remove('active');
        this.showNotification(`Статус команды изменен на "${this.getStatusText(status)}"`, 'success');
    }

    // Удаление команды
    deleteTeam(teamId) {
        if (!confirm('Вы уверены, что хотите удалить эту команду? Это действие нельзя отменить.')) {
            return;
        }
        
        const teamIndex = this.data.teams.findIndex(t => t.id === teamId);
        
        if (teamIndex === -1) {
            this.showNotification('Команда не найдена', 'error');
            return;
        }
        
        const teamName = this.data.teams[teamIndex].name;
        this.data.teams.splice(teamIndex, 1);
        this.saveData();
        this.updateUI();
        this.elements.teamDetailsModal.classList.remove('active');
        this.showNotification(`Команда "${teamName}" удалена`, 'success');
    }

    // Заполнение настроек турнира
    fillTournamentSettings() {
        const tournament = this.data.tournament;
        const settings = this.data.settings;
        
        this.elements.tournamentName.value = tournament.name || '';
        this.elements.tournamentStatus.value = tournament.status || 'registration';
        this.elements.tournamentStartDate.value = tournament.startDate || '';
        this.elements.tournamentRegEndDate.value = tournament.regEndDate || '';
        this.elements.tournamentFormat.value = tournament.format || '';
        this.elements.tournamentPrizePool.value = tournament.prizePool || '';
        this.elements.tournamentDescription.value = tournament.description || '';
        this.elements.tournamentMaxTeams.value = settings.maxTeams || 32;
        this.elements.tournamentRequireApproval.checked = settings.requireApproval !== false;
    }

    // Сохранение настроек турнира
    saveTournamentSettings() {
        this.data.tournament = {
            name: this.elements.tournamentName.value,
            status: this.elements.tournamentStatus.value,
            startDate: this.elements.tournamentStartDate.value,
            regEndDate: this.elements.tournamentRegEndDate.value,
            format: this.elements.tournamentFormat.value,
            prizePool: this.elements.tournamentPrizePool.value,
            description: this.elements.tournamentDescription.value
        };
        
        this.data.settings.maxTeams = parseInt(this.elements.tournamentMaxTeams.value) || 32;
        this.data.settings.requireApproval = this.elements.tournamentRequireApproval.checked;
        
        this.saveData();
        this.updateUI();
        this.showNotification('Настройки турнира сохранены', 'success');
    }

    // Заполнение системных настроек
    fillSystemSettings() {
        this.elements.adminPasswordSetting.value = this.settings.adminPassword || 'astra2023';
        this.elements.adminEmail.value = this.settings.adminEmail || '';
        this.elements.googleSheetsUrl.value = this.settings.googleSheetsUrl || '';
        this.elements.enableEmailNotifications.checked = this.settings.enableEmailNotifications || false;
        this.elements.enableAutoBackup.checked = this.settings.enableAutoBackup || false;
    }

    // Сохранение системных настроек
    saveSystemSettings() {
        this.settings.adminPassword = this.elements.adminPasswordSetting.value;
        this.settings.adminEmail = this.elements.adminEmail.value;
        this.settings.googleSheetsUrl = this.elements.googleSheetsUrl.value;
        this.settings.enableEmailNotifications = this.elements.enableEmailNotifications.checked;
        this.settings.enableAutoBackup = this.elements.enableAutoBackup.checked;
        
        localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
        this.showNotification('Системные настройки сохранены', 'success');
    }

    // Открытие регистрации
    openRegistration() {
        this.data.tournament.status = 'registration';
        this.data.settings.registrationOpen = true;
        this.saveData();
        this.updateUI();
        this.showNotification('Регистрация открыта', 'success');
    }

    // Закрытие регистрации
    closeRegistration() {
        this.data.tournament.status = 'closed';
        this.data.settings.registrationOpen = false;
        this.saveData();
        this.updateUI();
        this.showNotification('Регистрация закрыта', 'success');
    }

    // Экспорт всех данных
    exportAllData() {
        const exportData = {
            teams: this.data.teams,
            tournament: this.data.tournament,
            settings: this.data.settings,
            systemSettings: this.settings,
            exportDate: new Date().toISOString()
        };
        
        this.downloadJSON(exportData, 'astra-tournament-all-data.json');
    }

    // Экспорт команд в CSV
    exportTeamsCSV() {
        const headers = ['ID', 'Название', 'Тег', 'Статус', 'Telegram', 'ВКонтакте', 'Email', 'Дата регистрации'];
        const rows = this.data.teams.map(team => [
            team.id,
            `"${team.name}"`,
            team.tag,
            this.getStatusText(team.status),
            team.contacts.telegram || '',
            team.contacts.vk || '',
            team.contacts.email || '',
            team.registrationDate
        ]);
        
        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        this.downloadCSV(csvContent, 'astra-teams.csv');
    }

    // Экспорт всех данных в CSV
    exportAllDataCSV() {
        // Создаем несколько CSV файлов для разных данных
        this.exportTeamsCSV();
        
        // Экспорт игроков
        const playerRows = [];
        this.data.teams.forEach(team => {
            team.players.forEach(player => {
                playerRows.push([
                    team.id,
                    team.name,
                    player.position,
                    `"${player.nickname}"`,
                    player.id,
                    'Основной'
                ]);
            });
            
            if (team.reservePlayer) {
                playerRows.push([
                    team.id,
                    team.name,
                    '6',
                    `"${team.reservePlayer.nickname}"`,
                    team.reservePlayer.id,
                    'Запасной'
                ]);
            }
        });
        
        const playerHeaders = ['ID команды', 'Название команды', 'Позиция', 'Никнейм', 'Игровой ID', 'Статус'];
        const playerCsv = [playerHeaders.join(','), ...playerRows.map(row => row.join(','))].join('\n');
        this.downloadCSV(playerCsv, 'astra-players.csv');
    }

    // Экспорт в JSON
    exportJSON() {
        this.downloadJSON(this.data, 'astra-tournament-data.json');
    }

    // Печать списка команд
    printTeams() {
        const printWindow = window.open('', '_blank');
        const teams = this.data.teams;
        
        let html = `
            <html>
            <head>
                <title>Список команд - Astra Tournament</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #007AFF; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
                    .pending { background: #FF9500; color: white; }
                    .confirmed { background: #34C759; color: white; }
                    .rejected { background: #FF3B30; color: white; }
                </style>
            </head>
            <body>
                <h1>Список команд - Astra Tournament</h1>
                <p>Всего команд: ${teams.length}</p>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название</th>
                            <th>Тег</th>
                            <th>Статус</th>
                            <th>Контакты</th>
                            <th>Дата регистрации</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        teams.forEach(team => {
            let contacts = [];
            if (team.contacts.telegram) contacts.push(`TG: ${team.contacts.telegram}`);
            if (team.contacts.vk) contacts.push(`VK: ${team.contacts.vk}`);
            if (team.contacts.email) contacts.push(`Email: ${team.contacts.email}`);
            
            html += `
                <tr>
                    <td>${team.id}</td>
                    <td>${team.name}</td>
                    <td>${team.tag}</td>
                    <td><span class="status ${team.status}">${this.getStatusText(team.status)}</span></td>
                    <td>${contacts.join('<br>')}</td>
                    <td>${team.registrationDate}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
                <p style="margin-top: 20px; font-size: 12px; color: #666;">
                    Сгенерировано: ${new Date().toLocaleString('ru-RU')}
                </p>
            </body>
            </html>
        `;
        
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    }

    // Печать подтвержденных команд
    printConfirmedTeams() {
        const confirmedTeams = this.data.teams.filter(t => t.status === 'confirmed');
        if (confirmedTeams.length === 0) {
            this.showNotification('Нет подтвержденных команд для печати', 'warning');
            return;
        }
        
        const printWindow = window.open('', '_blank');
        
        let html = `
            <html>
            <head>
                <title>Подтвержденные команды - Astra Tournament</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #34C759; }
                    .team { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
                    .team-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
                    .team-name { font-weight: bold; font-size: 18px; }
                    .team-tag { background: #007AFF; color: white; padding: 4px 12px; border-radius: 4px; }
                    .players { margin-top: 10px; }
                    .player { margin-bottom: 5px; }
                    .contacts { margin-top: 10px; font-size: 14px; color: #666; }
                </style>
            </head>
            <body>
                <h1>Подтвержденные команды - Astra Tournament</h1>
                <p>Количество: ${confirmedTeams.length}</p>
        `;
        
        confirmedTeams.forEach(team => {
            let playersHTML = team.players.map(p => 
                `<div class="player">${p.position}. ${p.nickname} (ID: ${p.id})</div>`
            ).join('');
            
            if (team.reservePlayer) {
                playersHTML += `<div class="player"><strong>Запасной:</strong> ${team.reservePlayer.nickname} (ID: ${team.reservePlayer.id})</div>`;
            }
            
            let contacts = [];
            if (team.contacts.telegram) contacts.push(`Telegram: ${team.contacts.telegram}`);
            if (team.contacts.vk) contacts.push(`ВКонтакте: ${team.contacts.vk}`);
            if (team.contacts.email) contacts.push(`Email: ${team.contacts.email}`);
            
            html += `
                <div class="team">
                    <div class="team-header">
                        <div class="team-name">${team.name}</div>
                        <div class="team-tag">${team.tag}</div>
                    </div>
                    <div class="players">${playersHTML}</div>
                    <div class="contacts">${contacts.join(' | ')}</div>
                </div>
            `;
        });
        
        html += `
                <p style="margin-top: 20px; font-size: 12px; color: #666;">
                    Сгенерировано: ${new Date().toLocaleString('ru-RU')}
                </p>
            </body>
            </html>
        `;
        
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    }

    // Предпросмотр данных
    previewData() {
        const dataType = this.elements.exportDataType.value;
        
        let previewData;
        switch (dataType) {
            case 'teams':
                previewData = this.data.teams;
                break;
            case 'all':
                previewData = {
                    teams: this.data.teams,
                    tournament: this.data.tournament,
                    settings: this.data.settings
                };
                break;
            case 'settings':
                previewData = {
                    tournamentSettings: this.data.tournament,
                    systemSettings: this.settings,
                    appSettings: this.data.settings
                };
                break;
        }
        
        this.elements.dataPreview.textContent = JSON.stringify(previewData, null, 2);
    }

    // Показать модальное окно бэкапов
    showBackupModal() {
        this.loadBackupList();
        this.elements.backupModal.classList.add('active');
    }

    // Загрузка списка бэкапов
    loadBackupList() {
        this.backups = JSON.parse(localStorage.getItem(this.backupsKey)) || [];
        
        this.elements.backupList.innerHTML = '';
        
        if (this.backups.length === 0) {
            this.elements.backupList.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
                    <i class="fas fa-database" style="font-size: 32px; margin-bottom: 10px; opacity: 0.3;"></i>
                    <p>Нет сохраненных резервных копий</p>
                </div>
            `;
            return;
        }
        
        this.backups.forEach((backup, index) => {
            const backupItem = document.createElement('div');
            backupItem.className = 'backup-item';
            backupItem.style.cssText = `
                display: flex; justify-content: space-between; align-items: center;
                padding: 12px; background: var(--bg); border-radius: var(--radius-sm);
                margin-bottom: 10px;
            `;
            
            const date = new Date(backup.date);
            const dateStr = date.toLocaleString('ru-RU');
            
            backupItem.innerHTML = `
                <div>
                    <div style="font-weight: 500;">Резервная копия #${index + 1}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">${dateStr}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">
                        Команд: ${backup.data.teams?.length || 0}
                    </div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="table-btn restore-backup" data-index="${index}" title="Восстановить">
                        <i class="fas fa-upload"></i>
                    </button>
                    <button class="table-btn delete-backup" data-index="${index}" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            this.elements.backupList.appendChild(backupItem);
        });
        
        // Добавляем обработчики для кнопок бэкапов
        document.querySelectorAll('.restore-backup').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('button').dataset.index);
                this.restoreBackup(index);
            });
        });
        
        document.querySelectorAll('.delete-backup').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('button').dataset.index);
                this.deleteBackup(index);
            });
        });
    }

    // Создание бэкапа
    createBackup() {
        const backup = {
            date: new Date().toISOString(),
            data: JSON.parse(JSON.stringify(this.data)),
            settings: JSON.parse(JSON.stringify(this.settings))
        };
        
        this.backups.unshift(backup);
        
        // Ограничиваем количество бэкапов (последние 10)
        if (this.backups.length > 10) {
            this.backups = this.backups.slice(0, 10);
        }
        
        localStorage.setItem(this.backupsKey, JSON.stringify(this.backups));
        this.loadBackupList();
        this.showNotification('Резервная копия создана', 'success');
    }

    // Восстановление бэкапа
    restoreBackup(index) {
        if (!confirm('Вы уверены, что хотите восстановить эту резервную копию? Текущие данные будут заменены.')) {
            return;
        }
        
        if (index < 0 || index >= this.backups.length) {
            this.showNotification('Резервная копия не найдена', 'error');
            return;
        }
        
        const backup = this.backups[index];
        this.data = JSON.parse(JSON.stringify(backup.data));
        this.settings = JSON.parse(JSON.stringify(backup.settings));
        
        this.saveData();
        localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
        
        this.updateUI();
        this.elements.backupModal.classList.remove('active');
        this.showNotification('Данные восстановлены из резервной копии', 'success');
    }

    // Удаление бэкапа
    deleteBackup(index) {
        if (!confirm('Вы уверены, что хотите удалить эту резервную копию?')) {
            return;
        }
        
        if (index < 0 || index >= this.backups.length) {
            this.showNotification('Резервная копия не найдена', 'error');
            return;
        }
        
        this.backups.splice(index, 1);
        localStorage.setItem(this.backupsKey, JSON.stringify(this.backups));
        this.loadBackupList();
        this.showNotification('Резервная копия удалена', 'success');
    }

    // Показать модальное окно восстановления
    showRestoreModal() {
        this.showBackupModal();
    }

    // Сброс всех данных
    resetAllData() {
        if (!confirm('ВНИМАНИЕ! Вы собираетесь сбросить ВСЕ данные приложения. Это удалит все команды и настройки. Это действие нельзя отменить. Продолжить?')) {
            return;
        }
        
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
        
        this.data = initialData;
        this.saveData();
        
        // Также удаляем регистрации пользователей
        localStorage.removeItem('userRegistration');
        
        this.updateUI();
        this.showNotification('Все данные сброшены до начального состояния', 'success');
    }

    // Очистка всех данных
    clearAllData() {
        if (!confirm('ВНИМАНИЕ! Вы собираетесь удалить ВСЕ данные приложения. Это удалит все команды, настройки и резервные копии. Это действие нельзя отменить. Продолжить?')) {
            return;
        }
        
        localStorage.removeItem(this.dataKey);
        localStorage.removeItem(this.settingsKey);
        localStorage.removeItem(this.backupsKey);
        localStorage.removeItem('userRegistration');
        
        this.loadData();
        this.updateUI();
        this.showNotification('Все данные удалены', 'success');
    }

    // Обработка входа
    handleLogin() {
        const password = this.elements.adminPassword.value;
        
        if (!password) {
            this.showError('Введите пароль', 'passwordError');
            return;
        }
        
        if (password === this.settings.adminPassword || password === 'astra2023') {
            // Создаем сессию на 24 часа
            const session = {
                loggedIn: true,
                expires: Date.now() + (24 * 60 * 60 * 1000)
            };
            
            localStorage.setItem(this.adminSessionKey, JSON.stringify(session));
            this.isAuthenticated = true;
            this.showAuthScreen();
            this.updateUI();
            this.showNotification('Вход выполнен успешно', 'success');
        } else {
            this.showError('Неверный пароль', 'passwordError');
        }
    }

    // Обработка выхода
    handleLogout() {
        localStorage.removeItem(this.adminSessionKey);
        this.isAuthenticated = false;
        this.showAuthScreen();
        this.showNotification('Выход выполнен', 'success');
    }

    // Переключение секций
    switchSection(section) {
        document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
        
        document.querySelector(`.menu-btn[data-section="${section}"]`).classList.add('active');
        document.getElementById(`${section}-section`).classList.add('active');
    }

    // Показать ошибку
    showError(message, elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
            setTimeout(() => {
                element.style.display = 'none';
            }, 5000);
        }
    }

    // Показать уведомление
    showNotification(message, type = 'success') {
        this.elements.adminNotification.textContent = message;
        this.elements.adminNotification.className = `notification ${type}`;
        this.elements.adminNotification.style.display = 'block';
        
        setTimeout(() => {
            this.elements.adminNotification.style.display = 'none';
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

    // Скачивание файла
    downloadCSV(content, filename) {
        const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
        this.downloadFile(blob, filename);
    }

    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        this.downloadFile(blob, filename);
    }

    downloadFile(blob, filename) {
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Инициализация админ-панели
document.addEventListener('DOMContentLoaded', () => {
    window.admin = new AstraTournamentAdmin();
});