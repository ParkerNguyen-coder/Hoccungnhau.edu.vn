/* ==========================================================================
   HỌC CÙNG NHAU - EXPORT PDF & PRINT ENGINE
   ========================================================================== */

const PDFPrintService = {
    printQuiz: function(quizData, title) {
        const printWindow = window.open('', '_blank');
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>In Đề Thi - ${title}</title>
                <style>
                    body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.5; color: #000; }
                    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                    .title { font-size: 18pt; font-weight: bold; text-transform: uppercase; }
                    .subtitle { font-size: 12pt; font-style: italic; }
                    .question-item { margin-bottom: 18px; page-break-inside: avoid; }
                    .q-text { font-weight: bold; font-size: 12pt; }
                    .options { margin-left: 20px; margin-top: 5px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
                    .footer { margin-top: 30px; text-align: center; font-size: 10pt; border-top: 1px solid #ccc; padding-top: 10px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="title">HỌC CÙNG NHAU (hoccungnhau.edu.vn)</div>
                    <div class="subtitle">ĐỀ THI TRẮC NGHIỆM 20 CÂU - ${title}</div>
                    <div style="margin-top:10px;">Họ và tên thí sinh: .................................................... Lớp: ........................</div>
                </div>
                
                <div class="questions-list">
                    ${quizData.map((q, idx) => `
                        <div class="question-item">
                            <div class="q-text">Câu ${idx + 1}: ${q.question}</div>
                            <div class="options">
                                ${q.options.map(opt => `<div>${opt}</div>`).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="footer">
                    --- HẾT --- (Đề thi gồm 20 câu trắc nghiệm. Thí sinh tô tròn vào phiếu trả lời)
                </div>
                
                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
    }
};
