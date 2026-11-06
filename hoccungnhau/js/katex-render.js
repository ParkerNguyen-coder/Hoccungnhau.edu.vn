/* ==========================================================================
   HỌC CÙNG NHAU - KATEX & MATH FORMULA BEAUTIFIER
   ========================================================================== */

const MathRenderEngine = {
    render: function(element) {
        if (!element) return;
        
        // Simple LaTeX-like replacement for clean math presentation if KaTeX CDN is loaded or offline
        if (typeof renderMathInElement !== 'undefined') {
            try {
                renderMathInElement(element, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '$', right: '$', display: false},
                        {left: '\\(', right: '\\)', display: false},
                        {left: '\\[', right: '\\]', display: true}
                    ],
                    throwOnError: false
                });
            } catch(e) {
                console.warn("KaTeX render error:", e);
            }
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    MathRenderEngine.render(document.body);
});
