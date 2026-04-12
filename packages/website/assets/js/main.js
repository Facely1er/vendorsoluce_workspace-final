
// FAQ accordion (guarded: only runs when toggle and .faq-item exist)
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-faq-toggle]");
  if (!btn) return;
  const item = btn.closest(".faq-item");
  if (!item) return;
  const open = item.getAttribute("data-open") === "true";
  item.setAttribute("data-open", String(!open));
});
