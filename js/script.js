"use strict";

document.documentElement.classList.add("js-enabled");

/* 
   1. SELECT ELEMENTS
*/

const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector("#nav-links");
const navItems = document.querySelectorAll(".nav-link");
const backToTop = document.querySelector("#back-to-top");
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const sections = Array.from(
    document.querySelectorAll("main section[id]")
);


/* 
   2. MOBILE NAVIGATION
*/

function closeMenu() {
    if (!menuToggle || !navLinks) return;

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");

    navLinks.classList.remove("open");
    document.body.classList.remove("menu-open");
}

function openMenu() {
    if (!menuToggle || !navLinks) return;

    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close navigation");

    navLinks.classList.add("open");
    document.body.classList.add("menu-open");
}

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        const isOpen =
            menuToggle.getAttribute("aria-expanded") === "true";

        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeMenu();
    }
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 680) {
        closeMenu();
    }

    updateScrollUI();
});


/* 
   3. PRECISE SECTION SCROLLING
 */

/*
   Calculate the section's document position and subtract
   the actual visible navbar height.
  
   This avoids relying on scroll-margin and scroll-padding,
   which were competing with the previous scroll behavior.
 */
function scrollToSection(section, behavior = "smooth") {
    if (!section) return;

    const headerHeight = header
        ? header.getBoundingClientRect().height
        : 0;

    const sectionDocumentTop =
        section.getBoundingClientRect().top + window.scrollY;

    const destination = Math.max(
        0,
        sectionDocumentTop - headerHeight
    );

    window.scrollTo({
        top: destination,
        behavior
    });
}

/*
   Handle internal links consistently:
   navbar links, hero buttons, the About link and logo.
 */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");

        if (!href || href === "#") return;

        const target = document.getElementById(
            href.substring(1)
        );

        if (!target) return;

        event.preventDefault();
        closeMenu();

        /*
         * Update the URL without triggering a second,
         * browser-native scroll.
         */
        if (window.location.hash !== href) {
            history.pushState(null, "", href);
        }

        scrollToSection(target, "smooth");
    });
});

/*
   Correct the scroll position when the page is opened
   directly with a URL such as index.html#projects.
 */
function alignInitialHash() {
    const hash = window.location.hash;

    if (!hash || hash.length < 2) {
        updateScrollUI();
        return;
    }

    let target = null;

    try {
        target = document.getElementById(
            decodeURIComponent(hash.substring(1))
        );
    } catch {
        target = null;
    }

    if (target) {
        scrollToSection(target, "instant");
    }

    updateScrollUI();
}

window.addEventListener("load", alignInitialHash);

window.addEventListener("pageshow", () => {
    updateScrollUI();
});

/*
   Handle browser Back and Forward navigation.
 */
window.addEventListener("popstate", () => {
    if (window.location.hash) {
        let target = null;

        try {
            target = document.getElementById(
                decodeURIComponent(
                    window.location.hash.substring(1)
                )
            );
        } catch {
            target = null;
        }

        if (target) {
            scrollToSection(target, "smooth");
        }
    } else {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
});


/* =========================================
   4. ACTIVE NAVIGATION AND BACK-TO-TOP
========================================= */

function updateScrollUI() {
    const scrollPosition = window.scrollY;

    if (backToTop) {
        backToTop.classList.toggle(
            "visible",
            scrollPosition > 400
        );
    }

    if (sections.length === 0) return;

    const headerHeight = header
        ? header.getBoundingClientRect().height
        : 0;

    /*
     * Find the last section whose top has reached the
     * activation line just below the navbar.
     */
    const activationLine = headerHeight + 35;
    let currentSection = sections[0].id;

    for (const section of sections) {
        const rect = section.getBoundingClientRect();

        if (rect.top <= activationLine) {
            currentSection = section.id;
        } else {
            break;
        }
    }

    /*
     * At the very bottom, the last section should be active.
     */
    const atBottom =
        window.innerHeight + scrollPosition >=
        document.documentElement.scrollHeight - 5;

    if (atBottom) {
        currentSection = sections[sections.length - 1].id;
    }

    navItems.forEach((link) => {
        const isActive =
            link.getAttribute("href") === `#${currentSection}`;

        link.classList.toggle("active", isActive);

        if (isActive) {
            link.setAttribute("aria-current", "location");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}

window.addEventListener("scroll", updateScrollUI, {
    passive: true
});

updateScrollUI();

/* Back-to-top button */
if (backToTop) {
    backToTop.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        if (window.location.hash) {
            history.pushState(
                null,
                "",
                window.location.pathname + window.location.search
            );
        }
    });
}


/* =========================================
   5. REVEAL ANIMATIONS
========================================= */

const revealElements = document.querySelectorAll(".reveal");

const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

if (
    "IntersectionObserver" in window &&
    !prefersReducedMotion
) {
    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.08,
            rootMargin: "0px 0px -20px 0px"
        }
    );

    revealElements.forEach((element) => {
        revealObserver.observe(element);
    });
} else {
    revealElements.forEach((element) => {
        element.classList.add("is-visible");
    });
}


/* =========================================
   6. FOOTER YEAR
========================================= */

const currentYear = document.querySelector("#current-year");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}


/* =========================================
   7. CONTACT FORM VALIDATION
========================================= */

if (contactForm && formStatus) {
    const nameInput = document.querySelector("#name");
    const emailInput = document.querySelector("#email");
    const messageInput = document.querySelector("#message");

    const nameError = document.querySelector("#name-error");
    const emailError = document.querySelector("#email-error");
    const messageError = document.querySelector("#message-error");

    const fields = [
        {
            input: nameInput,
            error: nameError,

            validate(value) {
                if (!value.trim()) {
                    return "Please enter your name.";
                }

                if (value.trim().length < 2) {
                    return "Name must contain at least 2 characters.";
                }

                return "";
            }
        },

        {
            input: emailInput,
            error: emailError,

            validate(value) {
                if (!value.trim()) {
                    return "Please enter your email address.";
                }

                if (!this.input.validity.valid) {
                    return "Please enter a valid email address.";
                }

                return "";
            }
        },

        {
            input: messageInput,
            error: messageError,

            validate(value) {
                if (!value.trim()) {
                    return "Please enter a message.";
                }

                if (value.trim().length < 10) {
                    return "Message must contain at least 10 characters.";
                }

                return "";
            }
        }
    ];

    function validateField(field) {
        if (!field.input || !field.error) {
            return false;
        }

        const errorMessage = field.validate(field.input.value);

        field.error.textContent = errorMessage;

        field.input.setAttribute(
            "aria-invalid",
            String(Boolean(errorMessage))
        );

        return errorMessage === "";
    }

    fields.forEach((field) => {
        if (!field.input) return;

        field.input.addEventListener("input", () => {
            validateField(field);
            formStatus.textContent = "";
        });

        field.input.addEventListener("blur", () => {
            if (field.input.value.trim()) {
                validateField(field);
            }
        });
    });

    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const results = fields.map(validateField);
        const isValid = results.every(Boolean);

        if (!isValid) {
            formStatus.textContent =
                "Please correct the highlighted fields.";

            const firstInvalidIndex = results.indexOf(false);
            const firstInvalidField = fields[firstInvalidIndex];

            if (firstInvalidField && firstInvalidField.input) {
                firstInvalidField.input.focus();
            }

            return;
        }

        formStatus.textContent =
            "Validation successful! This demo does not send messages yet.";
    });
}