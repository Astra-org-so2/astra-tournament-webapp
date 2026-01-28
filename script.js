class RegistrationApp {
    constructor() {
        // ВАШ РЕАЛЬНЫЙ URL ЗДЕСЬ!
        this.API_BASE_URL = 'https://script.google.com/macros/s/AKfycbyEfGh7OsYQo_nuWetV--MKHkVDUdWyCDOfXZJKuPIBMkFLSDtlysdNiOdi8BijSbiAgg/exec';
        this.tournamentId = null;
        this.captainId = null;
        this.isRegistered = false;
        this.currentTournament = null;
        this.init();

    init() {
        this.getUrlParams();
        this.loadTournamentInfo();
        this.setupEventListeners();
        this.setCaptainId();
    }

    getUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        this.tournamentId = urlParams.get('tournament_id');
        this.captainId = urlParams.get('captain_id');
        
        if (!this.tournamentId || !this.captainId) {
            this.showError('Неверная ссылка. Пожалуйста, используйте кнопку из Telegram бота.');
            return;
        }
        
        // Показываем ID капитана
        document.getElementById('captainIdDisplay').textContent = this.captainId;
    }

    async loadTournamentInfo() {
        try {
            const response = await this.apiRequest('GET', {
                action: 'get_tournament',
                tournament_id: this.tournamentId
            });
            
            if (response.tournament) {
                this.currentTournament = response.tournament;
                this.updateTournamentUI();
                
                // Проверяем, зарегистрирован ли уже капитан
                await this.checkRegistrationStatus();
            } else {
                this.showError('Турнир не найден');
            }
        } catch (error) {
            console.error('Ошибка загрузки информации:', error);
            this.showError('Не удалось загрузить информацию о турнире');
        }
    }

    updateTournamentUI() {
        const tournamentInfo = document.getElementById('tournamentInfo');
        const tournament = this.currentTournament;
        
        let statusEmoji = '🟡';
        let statusText = 'В скором времени';
        let statusClass = 'planned';
        
        if (tournament.status === 'registration_open') {
            statusEmoji = '🟢';
            statusText = 'Регистрация открыта';
            statusClass = 'open';
        } else if (tournament.status === 'registration_closed') {
            statusEmoji = '🔴';
            statusText = 'Регистрация закрыта';
            statusClass = 'closed';
        }
        
        tournamentInfo.innerHTML = `
            <div class="tournament-header">
                <h3><i class="fas fa-trophy"></i> ${tournament.name}</h3>
                <span class="status-badge ${statusClass}">${statusEmoji} ${statusText}</span>
            </div>
            <div class="tournament-details">
                <p><i class="far fa-calendar-alt"></i> Начало: <strong>${tournament.start_date}</strong></p>
                <p><i class="fas fa-users"></i> Команд: <strong>${tournament.registered_teams}/${tournament.max_teams}</strong></p>
                <p><i class="fas fa-crown"></i> Капитан ID: <strong>${this.captainId}</strong></p>
            </div>
        `;
        
        // Если регистрация закрыта, скрываем форму
        if (tournament.status !== 'registration_open') {
            this.showRegistrationClosed();
        }
    }

    async checkRegistrationStatus() {
        try {
            const response = await this.apiRequest('GET', {
                action: 'check_registration',
                captain_id: this.captainId,
                tournament_id: this.tournamentId
            });
            
            if (response.registered) {
                this.isRegistered = true;
                this.showAlreadyRegistered(response.team_name);
            }
        } catch (error) {
            console.error('Ошибка проверки регистрации:', error);
        }
    }

    showAlreadyRegistered(teamName) {
        const statusMessage = document.getElementById('statusMessage');
        const form = document.getElementById('registrationForm');
        
        statusMessage.innerHTML = `
            <div class="status-message registered">
                <div class="status-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Регистрация уже выполнена!</h3>
                <p>Вы уже зарегистрировали команду <strong>"${teamName}"</strong> на этот турнир.</p>
                <p>Ожидайте начала турнира и следите за обновлениями.</p>
                <button onclick="window.close()" class="btn-primary">
                    <i class="fas fa-times"></i> Закрыть
                </button>
            </div>
        `;
        
        form.style.display = 'none';
        statusMessage.style.display = 'block';
    }

    showRegistrationClosed() {
        const statusMessage = document.getElementById('statusMessage');
        const form = document.getElementById('registrationForm');
        
        statusMessage.innerHTML = `
            <div class="status-message closed">
                <div class="status-icon">
                    <i class="fas fa-lock"></i>
                </div>
                <h3>Регистрация закрыта!</h3>
                <p>Регистрация на турнир <strong>"${this.currentTournament.name}"</strong> временно закрыта.</p>
                <p>Следите за новыми турнирами в нашем боте.</p>
                <button onclick="window.close()" class="btn-primary">
                    <i class="fas fa-times"></i> Закрыть
                </button>
            </div>
        `;
        
        form.style.display = 'none';
        statusMessage.style.display = 'block';
    }

    showError(message) {
        const statusMessage = document.getElementById('statusMessage');
        statusMessage.innerHTML = `
            <div class="status-message error">
                <div class="status-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Ошибка!</h3>
                <p>${message}</p>
                <button onclick="window.location.reload()" class="btn-secondary">
                    <i class="fas fa-redo"></i> Обновить
                </button>
            </div>
        `;
        statusMessage.style.display = 'block';
        
        // Скрываем форму
        document.getElementById('registrationForm').style.display = 'none';
    }

    showSuccess() {
        const form = document.getElementById('registrationForm');
        const successMessage = document.getElementById('successMessage');
        
        form.style.display = 'none';
        successMessage.style.display = 'block';
        
        // Отправляем данные обратно в Telegram бота
        this.sendToTelegramBot();
    }

    setCaptainId() {
        document.getElementById('captainId').value = this.captainId;
        document.getElementById('captainIdDisplay').textContent = this.captainId;
    }

    setupEventListeners() {
        // Основные кнопки
        document.getElementById('submitBtn').addEventListener('click', () => this.submitForm());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearForm());
        document.getElementById('closeBtn').addEventListener('click', () => this.closeWebApp());
        
        // Валидация в реальном времени
        document.getElementById('contactInfo').addEventListener('input', (e) => {
            this.validateContactInfo(e.target);
        });
        
        document.getElementById('teamTag').addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        });
        
        // Автозаполнение никнейма капитана
        document.getElementById('captainNickname').addEventListener('focus', () => {
            if (!document.getElementById('captainNickname').value) {
                document.getElementById('captainNickname').value = `Капитан_${this.captainId.slice(-4)}`;
            }
        });
        
        // Копирование ID капитана
        document.getElementById('copyCaptainId').addEventListener('click', () => {
            navigator.clipboard.writeText(this.captainId);
            this.showToast('ID скопирован в буфер обмена');
        });
    }

    validateContactInfo(input) {
        const value = input.value.trim();
        
        // Разрешенные форматы:
        // Telegram: @username или t.me/username
        // VK: vk.com/id123 или vk.com/username
        const tgRegex = /^(@[a-zA-Z0-9_]{5,32}|(https?:\/\/)?(t\.me|telegram\.me)\/[a-zA-Z0-9_]{5,32})$/i;
        const vkRegex = /^(https?:\/\/)?(www\.)?(vk\.com\/[a-zA-Z0-9_.]+|m\.vk\.com\/[a-zA-Z0-9_.]+)$/i;
        
        if (!value) {
            input.setCustomValidity('');
            return;
        }
        
        if (!tgRegex.test(value) && !vkRegex.test(value)) {
            input.setCustomValidity('Формат: @username_telegram или vk.com/your_profile');
            input.classList.add('error');
        } else {
            input.setCustomValidity('');
            input.classList.remove('error');
        }
    }

    validateForm() {
        let isValid = true;
        
        // Проверка обязательных полей
        const requiredFields = [
            'teamName',
            'teamTag',
            'captainNickname',
            'player2Id', 'player2Nickname',
            'player3Id', 'player3Nickname',
            'player4Id', 'player4Nickname',
            'contactInfo'
        ];
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });
        
        if (!isValid) {
            this.showToast('Заполните все обязательные поля!');
            return false;
        }
        
        // Проверка уникальности ID игроков
        const playerIds = [
            this.captainId,
            document.getElementById('player2Id').value,
            document.getElementById('player3Id').value,
            document.getElementById('player4Id').value,
            document.getElementById('player5Id').value,
            document.getElementById('player6Id').value
        ].filter(id => id);
        
        const uniqueIds = new Set(playerIds);
        if (uniqueIds.size !== playerIds.length) {
            this.showToast('ID игроков должны быть уникальными!');
            return false;
        }
        
        // Проверка формата ID (только цифры для Telegram ID)
        const telegramIdFields = ['player2Id', 'player3Id', 'player4Id', 'player5Id', 'player6Id'];
        for (const fieldId of telegramIdFields) {
            const field = document.getElementById(fieldId);
            if (field.value && !/^\d+$/.test(field.value)) {
                field.classList.add('error');
                this.showToast('Telegram ID должны содержать только цифры!');
                return false;
            }
        }
        
        // Проверка длины названия команды
        const teamName = document.getElementById('teamName').value;
        if (teamName.length > 32) {
            document.getElementById('teamName').classList.add('error');
            this.showToast('Название команды не более 32 символов!');
            return false;
        }
        
        // Проверка тега команды
        const teamTag = document.getElementById('teamTag').value;
        if (teamTag.length > 6) {
            document.getElementById('teamTag').classList.add('error');
            this.showToast('Тег команды не более 6 символов!');
            return false;
        }
        
        return true;
    }

    collectFormData() {
        const data = {
            tournament_id: this.tournamentId,
            captain_id: this.captainId,
            team_name: document.getElementById('teamName').value.trim(),
            team_tag: document.getElementById('teamTag').value.trim(),
            contact_info: document.getElementById('contactInfo').value.trim(),
            additional_info: document.getElementById('additionalInfo').value.trim(),
            players: [
                {
                    id: this.captainId,
                    nickname: document.getElementById('captainNickname').value.trim()
                },
                {
                    id: document.getElementById('player2Id').value,
                    nickname: document.getElementById('player2Nickname').value.trim()
                },
                {
                    id: document.getElementById('player3Id').value,
                    nickname: document.getElementById('player3Nickname').value.trim()
                },
                {
                    id: document.getElementById('player4Id').value,
                    nickname: document.getElementById('player4Nickname').value.trim()
                }
            ],
            optional_players: []
        };
        
        // Добавляем опциональных игроков, если они заполнены
        const player5Id = document.getElementById('player5Id').value;
        const player5Nickname = document.getElementById('player5Nickname').value.trim();
        if (player5Id && player5Nickname) {
            data.optional_players.push({
                id: player5Id,
                nickname: player5Nickname
            });
        }
        
        const player6Id = document.getElementById('player6Id').value;
        const player6Nickname = document.getElementById('player6Nickname').value.trim();
        if (player6Id && player6Nickname) {
            data.optional_players.push({
                id: player6Id,
                nickname: player6Nickname
            });
        }
        
        return data;
    }

    async submitForm() {
        if (this.isRegistered) {
            this.showToast('Вы уже зарегистрированы на этот турнир!');
            return;
        }
        
        if (!this.validateForm()) {
            return;
        }
        
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Регистрация...';
        submitBtn.disabled = true;
        
        try {
            const formData = this.collectFormData();
            
            const response = await this.apiRequest('POST', {
                action: 'register_team',
                data: formData
            });
            
            if (response.success) {
                this.isRegistered = true;
                this.showSuccess();
            } else {
                throw new Error(response.error || 'Ошибка регистрации');
            }
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            this.showToast(error.message || 'Ошибка регистрации. Попробуйте еще раз.');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async apiRequest(method, params) {
        const url = new URL(this.API_BASE_URL);
        
        if (method === 'GET') {
            Object.keys(params).forEach(key => {
                url.searchParams.append(key, params[key]);
            });
        }
        
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (method === 'POST') {
            options.body = JSON.stringify(params);
        }
        
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API Request error:', error);
            throw error;
        }
    }

    sendToTelegramBot() {
        // Отправляем данные обратно в Telegram WebApp
        if (window.Telegram && Telegram.WebApp) {
            const formData = this.collectFormData();
            
            Telegram.WebApp.sendData(JSON.stringify({
                action: 'team_registered',
                tournament_id: this.tournamentId,
                team_name: formData.team_name,
                team_tag: formData.team_tag,
                players_count: formData.players.length + formData.optional_players.length
            }));
            
            // Закрываем WebApp через 3 секунды
            setTimeout(() => {
                Telegram.WebApp.close();
            }, 3000);
        }
    }

    clearForm() {
        if (confirm('Очистить все поля формы?')) {
            const form = document.getElementById('registrationForm');
            form.reset();
            
            // Восстанавливаем ID капитана
            document.getElementById('captainId').value = this.captainId;
            document.getElementById('captainIdDisplay').textContent = this.captainId;
            
            // Убираем классы ошибок
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.classList.remove('error');
            });
            
            this.showToast('Форма очищена');
        }
    }

    closeWebApp() {
        if (window.Telegram && Telegram.WebApp) {
            Telegram.WebApp.close();
        } else {
            window.close();
        }
    }

    showToast(message) {
        // Создаем или находим контейнер для тостов
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
            `;
            document.body.appendChild(toastContainer);
        }
        
        // Создаем тост
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;
        toast.style.cssText = `
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            margin-bottom: 10px;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        
        toastContainer.appendChild(toast);
        
        // Удаляем тост через 3 секунды
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const app = new RegistrationApp();
    
    // Добавляем CSS анимации
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .toast-message {
            animation: slideIn 0.3s ease;
        }
    `;
    document.head.appendChild(style);

});
