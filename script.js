// DOM이 완전히 로드되면 실행되는 이벤트 리스너
document.addEventListener('DOMContentLoaded', () => {
    // 필요한 DOM 요소들을 선택하여 변수에 할당
    const chatContainer = document.getElementById('chat-messages');
    const chatScroll = document.getElementById('chat-container');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const downloadHtmlBtn = document.getElementById('download-html');

    // 대화 내용을 저장할 배열 초기화
    let conversation = [
        {
            role: "system",
            content: "당신은 D&D 게임의 던전 마스터(DM)입니다. 플레이어들을 판타지 세계의 모험으로 안내하고, 그들의 선택에 따라 이야기를 진행하세요. D&D의 규칙을 따르되, 재미있고 흥미진진한 모험을 만들어주세요."
        }
    ];

    // 메시지를 화면에 추가하는 함수
    function addMessage(role, content) {
        // 새로운 div 요소 생성
        const messageElement = document.createElement('div');
        // 메시지 역할에 따라 클래스 설정
        messageElement.className = `message ${role}-message`;
        // 메시지 내용 삽입
        messageElement.innerHTML = `<div>${content}</div>`;
        // 채팅 컨테이너에 메시지 요소 추가
        chatContainer.appendChild(messageElement);
        // 스크롤을 최신 메시지 위치로 이동
        chatScroll.scrollTop = chatScroll.scrollHeight;
    }

    // 메시지를 서버로 전송하고 응답을 받는 함수
    async function sendMessage() {
        // 사용자 입력 값 가져오기 및 공백 제거
        const message = userInput.value.trim();
        if (!message) return; // 메시지가 비어있으면 함수 종료


        // 사용자 메시지를 화면에 추가
        addMessage('user', message);
        // 입력 필드 초기화 및 높이 조정
        userInput.value = '';
        userInput.style.height = 'auto';


        // 대화 배열에 사용자 메시지 추가  
        conversation.push({ role: "user", content: message });

        try {
            // fetch API를 사용하여 서버에 비동기 요청
            // await 키워드는 Promise가 resolve될 때까지 실행을 일시 중지
            const response = await fetch('https://open-api.jejucodingcamp.workers.dev/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(conversation)
            });

            // 응답이 성공적인 경우 
            if (response.ok) {
                // JSON 형식의 응답 데이터를 파싱
                const data = await response.json();
                // AI의 응답 추출
                const gptResponse = data.choices[0].message.content;
                // AI 응답을 화면에 추가
                addMessage('assistant', gptResponse);
                // 대화 배열에 AI 응답 추가
                conversation.push({ role: "assistant", content: gptResponse });
            } else {
                // 응답이 실패한 경우 에러 throw
                throw new Error('API 요청 실패');
            }
        } catch (error) {
            // 에러 발생 시 콘솔에 로그 출력 및 에러 메시지 화면에 표시
            console.error('Error:', error);
            addMessage('system', '오류가 발생했습니다. 다시 시도해주세요.');
        }
    }

    // 이벤트 리스너 설정
    // 전송 버튼 클릭 시 sendMessage 함수 호출
    sendBtn.addEventListener('click', sendMessage);
    // 입력 필드에서 Enter 키 입력 시 sendMessage 함수 호출 (Shift + Enter는 제외)
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // 초기 메시지 추가
    addMessage('assistant', '환영합니다, 모험가님! 캐릭터를 설정하고 판타지 세계로의 모험을 시작해보세요. 아래의 항목들을 참고하여 나만의 캐릭터를 설정해 보세요! (예시: **캐릭터 이름**: 롤란드  **종족**: 인간  **직업**: 전사 | | 캐릭터에 설정할 수 있는 항목을 알려줘, random start 등등)');

    // 배경 이미지 변경 기능
    // 사용 가능한 이미지 번호 배열 초기화
    let availableImages = Array.from({ length: 10 }, (_, i) => i);
    let usedImages = [];

    // 배경 이미지를 랜덤하게 변경하는 함수
    function changeBackgroundImage() {
        // 모든 이미지를 사용했다면 배열 초기화
        if (availableImages.length === 0) {
            availableImages = usedImages;
            usedImages = [];
        }
        // 랜덤 이미지 선택 및 배경 설정
        const randomIndex = Math.floor(Math.random() * availableImages.length);
        const imageNumber = availableImages.splice(randomIndex, 1)[0];
        usedImages.push(imageNumber);
        document.body.style.backgroundImage = `url('img/th${imageNumber}.jpg')`;
    }

    // 페이지 로드 시 배경 이미지 변경
    changeBackgroundImage();

    // 현재 날짜와 시간을 기반으로 파일명 생성 함수
    function getFormattedFilename(extension) {
        const now = new Date();
        return `conversation${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}_${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}_${String(now.getMinutes()).padStart(2, '0')}.${extension}`;
    }

   // HTML 파일 저장 기능

   function downloadHtml() {
    // 현재 채팅 메시지 내용 가져오기
    const chatMessages = document.getElementById('chat-messages').innerHTML;
    // CSS 스타일 정의
    const styles = `
        <style>
            body {
                font-family: cursive;
                background-size: contain;
                background-attachment: fixed;
                color: #f0e6d2;
                margin: 0;
                padding: 0;
            }
            
            #app {
                max-width: 1000px;
                margin: 0 auto;
                padding: 20px;
                background-color: rgba(0, 0, 0, 0.7);
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            }
            
            h1 {
                text-align: center;
                font-size: 2.5em;
                color: #ffd700;
                text-shadow: 2px 2px 4px #000000;
            }
            
            #chat-container {
                max-width: 1000px;
                height: auto;
                overflow-y: auto;
                border: 2px solid #8b4513;
                border-radius: 5px;
                padding: 10px;
                margin-bottom: 20px;
                background-color: rgba(0, 0, 0, 0.5);
            }
            
            #chat-messages {
                display: flex;
                flex-direction: column;
            }
            
            .message {
                max-width: 80%;
                margin-bottom: 10px;
                padding: 10px;
                border-radius: 5px;
                white-space: pre-wrap;
                word-wrap: break-word;
            }
            
            .user-message {
                background-color: #4b3621;
                align-self: flex-end;
                text-align: left;
                justify-content: flex-end; /* 메시지를 오른쪽에 배치 */	
            }
            
            .assistant-message {
                background-color: #2f4f4f;
                align-self: flex-start;
                text-align: left;
            }
            
            #input-container {
                display: flex;
            }
            
            #user-input {
                flex-grow: 1;
                resize: none;
                padding: 10px;
                border: 2px solid #8b4513;
                border-radius: 5px 0 0 5px;
                background-color: #2c2c2c;
                color: #f0e6d2;
                font-size: 16px;
                width: calc(100% - 80px); /* 버튼의 크기를 고려한 넓이 조정 */
                min-height: 40px;
                max-height: 150px; 
                overflow-y: auto;
            }
            
            
            #send-btn {
                padding: 10px 20px;
                font-size: 16px;
                background-color: #8b4513;
                color: #f0e6d2;
                border: none;
                border-radius: 0 5px 5px 0;
                cursor: pointer;
                transition: background-color 0.3s;
            }
            
            #send-btn:hover {
                background-color: #a0522d;
            }
            
            #download-html {
                padding: 10px 20px;
                font-size: 16px;
                background-color: #8b4513;
                color: #f0e6d2;
                border: none;
                border-radius: 0 5px 5px 0;
                cursor: pointer;
                transition: background-color 0.3s;
            }
            
            #download-html:hover {
                background-color: #a0522d;
            }            
        </style> 
        `;
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Chat History</title>
                ${styles}
            </head>
            <body>
            <div id="chat-container">
                <div id="chat-messages">
                    ${chatMessages}
                </div>
                </div>
            </body>
            </html>
        `;
        // Blob 객체 생성 (HTML 콘텐츠를 바이너리 데이터로 변환)
        const blob = new Blob([htmlContent], { type: 'text/html' });
        // Blob URL 생성
        const url = URL.createObjectURL(blob);
        // 다운로드 링크 생성 및 클릭 이벤트 발생
        const a = document.createElement('a');
        a.href = url;
        a.download = getFormattedFilename('html');
        document.body.appendChild(a);
        a.click();
        // 생성한 요소 및 URL 정리
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
        // HTML 다운로드 버튼에 이벤트 리스너 추가
        downloadHtmlBtn.addEventListener('click', downloadHtml);   

    });