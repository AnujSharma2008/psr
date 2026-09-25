// ==UserScript==
// @name         Pokemon Showdown Remastered
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Immersive Pokemon Showdown Skin, Keeping the showdown feeling :3
// @author       Dead Body
// @match        https://play.pokemonshowdown.com/*
// @match        https://pokepast.es/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pokemonshowdown.com
// @grant        GM_setValue
// @downloadURL  https://githubusercontent.com
// @updateURL    https://githubusercontent.com
// @grant        GM_addValueChangeListener
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        unsafeWindow
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // ============================================================
    // POKÉMON POSITIONING
    // ============================================================
    const POSITION = {

        singles: {
            group1: {
                xScale: 1.8,
                yScale: 1.0,
                xOffset: 30,
                yOffset: -20
            },
            group2: {
                xScale: 2.5,
                yScale: 1.0,
                xOffset: 70,
                yOffset: -10
            }
        },

        doubles: {
            group1: {
                xScale: 1.8,
                yScale: 1.0,
                xOffset: 30,
                yOffset: -20
            },
            group2: {
                xScale: 2.5,
                yScale: 1.0,
                xOffset: 70,
                yOffset: -10
            }
        },

        multi: {
            group1: {
                xScale: 1.8,
                yScale: 1.0,
                xOffset: 30,
                yOffset: -20
            },
            group2: {
                xScale: 2.5,
                yScale: 1.0,
                xOffset: 70,
                yOffset: -10
            }
        },

        ffa: {
            group1: {
                xScale: 1.0,
                yScale: 1.0,
                xOffset: 30,
                yOffset: -20
            },
            group2: {
                xScale: 1.5,
                yScale: 1.0,
                xOffset: 70,
                yOffset: -10
            }
        },

        triples: {
            group1: {
                xScale: 1.8,
                yScale: 1.0,
                xOffset: 30,
                yOffset: -20
            },
            group2: {
                xScale: 2.5,
                yScale: 1.0,
                xOffset: 70,
                yOffset: -10
            }
        }

    };


    function getBattleGameType() {

        const app =
            typeof unsafeWindow !== "undefined" ?
            unsafeWindow.app :
            window.app;

        const currentRoom =
            app?.curRoom;

        const battle =
            currentRoom?.battle ||
            currentRoom?.child?.battle;

        if (!battle) {
            return "singles";
        }

        return battle.gameType || "singles";
    }


    function getPositionSettings() {

        const gameType =
            getBattleGameType();

        if (gameType === "freeforall") {
            return POSITION.ffa;
        }

        if (gameType === "multi") {
            return POSITION.multi;
        }

        if (gameType === "triples") {
            return POSITION.triples;
        }

        if (gameType === "doubles") {
            return POSITION.doubles;
        }

        return POSITION.singles;
    }


    function installPokemonPositioning() {

        if (
            typeof BattleScene === "undefined" ||
            BattleScene.prototype.__widePokemonPatch
        ) {
            return;
        }

        const originalPos =
            BattleScene.prototype.pos;

        BattleScene.prototype.pos =
            function(loc, obj) {

                const p =
                    Object.assign({}, loc);

                if (typeof p.z === "number") {

                    const POSITION_SET =
                        getPositionSettings();

                    const group =
                        p.z < 100 ?
                        POSITION_SET.group1 :
                        POSITION_SET.group2;

                    p.x =
                        (p.x || 0) *
                        group.xScale +
                        group.xOffset;

                    p.y =
                        (p.y || 0) *
                        group.yScale +
                        group.yOffset;
                }

                return originalPos.call(
                    this,
                    p,
                    obj
                );
            };

        BattleScene.prototype.__widePokemonPatch =
            true;

        console.log(
            "✓ Pokémon + animation positioning installed."
        );
    }


    installPokemonPositioning();

    // ============================================================
    // USERNAME COLORS
    // ============================================================

    function getShowdownColor(name) {

        if (
            typeof BattleLog !== "undefined" &&
            typeof BattleLog.usernameColor === "function"
        ) {
            return BattleLog.usernameColor(toID(name));
        }

        return null;
    }


    function applyUsernameColor(element, name) {

        if (!element || !name) return;

        const color =
            getShowdownColor(name);

        if (!color) return;

        element.style.setProperty(
            "color",
            color,
            "important"
        );

        element.style.setProperty(
            "text-shadow",
            "none",
            "important"
        );

        element.style.setProperty(
            "text-decoration",
            "none",
            "important"
        );
    }


    function colorTrainerNames() {

        document
            .querySelectorAll(".trainer strong")
            .forEach(trainer => {

                const name =
                    trainer.textContent.trim();

                applyUsernameColor(
                    trainer,
                    name
                );

                trainer.style.setProperty(
                    "font-weight",
                    "700",
                    "important"
                );

                trainer.style.setProperty(
                    "letter-spacing",
                    "0.4px",
                    "important"
                );
            });


        document
            .querySelectorAll(
                ".userdetails strong a"
            )
            .forEach(link => {

                applyUsernameColor(
                    link,
                    link.textContent.trim()
                );

                link.style.setProperty(
                    "font-weight",
                    "700",
                    "important"
                );
            });
    }


    colorTrainerNames();


    new MutationObserver(
        colorTrainerNames
    ).observe(document.body, {
        childList: true,
        subtree: true
    });


    // ============================================================
    // PROFILE POPUPS
    // ============================================================

    const PROFILE_STYLE_ID =
        "profile-colored-buttons";


    function colorPSPopups() {

        document
            .querySelectorAll(".ps-popup")
            .forEach(popup => {

                const username =
                    popup.querySelector(
                        ".userdetails strong a"
                    );

                if (!username) return;

                const usernameColor =
                    getComputedStyle(username).color;

                if (!usernameColor) return;


                popup.style.setProperty(
                    "background-color",
                    usernameColor,
                    "important"
                );

                popup.style.setProperty(
                    "--profile-username-color",
                    usernameColor,
                    "important"
                );


                popup
                    .querySelectorAll("a")
                    .forEach(link => {

                        link.style.setProperty(
                            "color",
                            usernameColor,
                            "important"
                        );

                        link.style.setProperty(
                            "text-shadow",
                            "none",
                            "important"
                        );
                    });


                popup
                    .querySelectorAll(
                        ".button, button"
                    )
                    .forEach(button => {

                        button.style.setProperty(
                            "--profile-username-color",
                            usernameColor,
                            "important"
                        );
                    });
            });
    }


    function installProfileStyles() {

        if (
            document.getElementById(
                PROFILE_STYLE_ID
            )
        ) {
            return;
        }

        const style =
            document.createElement("style");

        style.id =
            PROFILE_STYLE_ID;

        style.textContent = `
.ps-popup[style*="--profile-username-color"] .button:hover,
.ps-popup[style*="--profile-username-color"] button:hover,
.ps-popup[style*="--profile-username-color"] .button:active,
.ps-popup[style*="--profile-username-color"] button:active,
.ps-popup[style*="--profile-username-color"] .button:focus-visible,
.ps-popup[style*="--profile-username-color"] button:focus-visible {

    background-color:
        var(--profile-username-color)
        !important;

    box-shadow:
        0 0 10px
        var(--profile-username-color)
        !important;
}
        `;

        document.head.appendChild(style);
    }


    installProfileStyles();
    colorPSPopups();


    new MutationObserver(
        colorPSPopups
    ).observe(document.body, {
        childList: true,
        subtree: true
    });
    (() => {

        const typeColors = {
            normal: "#9FA19E",
            fire: "#E32527",
            water: "#2B7EE8",
            electric: "#F9C102",
            grass: "#409D2B",
            ice: "#47D4F9",
            fighting: "#FC7C00",
            poison: "#8A3EC5",
            ground: "#8A4C1B",
            flying: "#7AB5EB",
            psychic: "#EF3A73",
            bug: "#8D9D18",
            rock: "#A8A477",
            ghost: "#6F3F6E",
            dragon: "#5667E1",
            dark: "#412D29",
            steel: "#3D7CB4",
            fairy: "#F078EC",
            curse: "#698"
        };


        let moveData = null;


        function getMoveID(name) {

            if (typeof toID === "function") {
                return toID(name);
            }

            return name
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "");
        }


        async function loadMoveData() {

            try {

                const response = await fetch(
                    "https://play.pokemonshowdown.com/data/moves.json", {
                        cache: "force-cache"
                    }
                );

                if (!response.ok) return;

                moveData = await response.json();

                colorMoves();

            } catch (error) {

                console.error(
                    "Move type colors failed:",
                    error
                );

            }
        }


        function colorMove(move) {

            if (!moveData) return;

            const moveName =
                move.textContent.trim();

            if (!moveName) return;


            const id =
                getMoveID(moveName);

            const data =
                moveData[id];

            if (
                !data ||
                !data.type
            ) return;


            const type =
                data.type.toLowerCase();


            if (type === "stellar") {

                move.style.setProperty(
                    "background",
                    `linear-gradient(
                    90deg,
                    #ff0000,
                    #ff8800,
                    #ffee00,
                    #22cc44,
                    #00bfff,
                    #5555ff,
                    #cc44ff,
                    #ff2299,
                    #ff0000
                )`,
                    "important"
                );

                move.style.setProperty(
                    "background-size",
                    "300% 100%",
                    "important"
                );

                move.style.setProperty(
                    "-webkit-background-clip",
                    "text",
                    "important"
                );

                move.style.setProperty(
                    "background-clip",
                    "text",
                    "important"
                );

                move.style.setProperty(
                    "-webkit-text-fill-color",
                    "transparent",
                    "important"
                );

                move.style.setProperty(
                    "font-weight",
                    "700",
                    "important"
                );

                move.style.setProperty(
                    "animation",
                    "stellarRainbow 4s linear infinite",
                    "important"
                );

                return;
            }


            const color =
                typeColors[type];

            if (!color) return;


            move.style.setProperty(
                "color",
                color,
                "important"
            );

            move.style.setProperty(
                "font-weight",
                "700",
                "important"
            );


            move.style.removeProperty(
                "background"
            );

            move.style.removeProperty(
                "background-size"
            );

            move.style.removeProperty(
                "-webkit-background-clip"
            );

            move.style.removeProperty(
                "background-clip"
            );

            move.style.removeProperty(
                "-webkit-text-fill-color"
            );

            move.style.removeProperty(
                "animation"
            );
        }


        function colorMoves() {

            if (!moveData) return;


            document.querySelectorAll(
                ".movenamecol"
            ).forEach(move => {

                colorMove(move);

            });


            document.querySelectorAll(
                ".movenamecol > a"
            ).forEach(move => {

                colorMove(move);

            });
        }


        if (!document.getElementById(
                "move-type-colors-style"
            )) {

            const style =
                document.createElement("style");

            style.id =
                "move-type-colors-style";

            style.textContent = `

            @keyframes stellarRainbow {

                0% {
                    background-position: 0% 50%;
                }

                50% {
                    background-position: 100% 50%;
                }

                100% {
                    background-position: 0% 50%;
                }

            }

        `;

            document.head.appendChild(style);
        }


        new MutationObserver(() => {

            colorMoves();

        }).observe(document.body, {
            childList: true,
            subtree: true
        });


        loadMoveData();

    })();

    // ============================================================
    // EMBEDDED POKÉPASTE VIEWER
    // ============================================================

    (() => {

        "use strict";

        const POKEPASTE_ROOM_ID =
            "room-pokepaste";

        const STYLE_ID =
            "ps-pokepaste-style";

        const STORAGE_KEY =
            "ps-pokepaste-last";

        const SPRITE_BASE =
            "https://play.pokemonshowdown.com/sprites/gen5/";

        const SHINY_SPRITE_BASE =
            "https://play.pokemonshowdown.com/sprites/gen5-shiny/";

        const ITEM_ICON_BASE =
            "https://play.pokemonshowdown.com/sprites/itemicons/";

        const DEX_URL =
            "https://play.pokemonshowdown.com/data/pokedex.json";

        const MOVE_URL =
            "https://play.pokemonshowdown.com/data/moves.json";

        const TYPE_COLORS = {
            normal: "#9FA19E",
            fire: "#E32527",
            water: "#2B7EE8",
            electric: "#F9C102",
            grass: "#409D2B",
            ice: "#47D4F9",
            fighting: "#FC7C00",
            poison: "#8A3EC5",
            ground: "#8A4C1B",
            flying: "#7AB5EB",
            psychic: "#EF3A73",
            bug: "#8D9D18",
            rock: "#A8A477",
            ghost: "#6F3F6E",
            dragon: "#5667E1",
            dark: "#412D29",
            steel: "#3D7CB4",
            fairy: "#F078EC",
            stellar: "#FFFFFF",
            curse: "#698"
        };

        const STAT_COLORS = {
            hp: "#ff4b4b",
            atk: "#ff8a00",
            def: "#f4c542",
            spa: "#4aa3ff",
            spd: "#42c96b",
            spe: "#e45cff"
        };

        let pokedexData = null;
        let moveData = null;
        let gameDataPromise = null;

        let lastPasteData = null;

        /*
         * Multiple persistent PokéPaste tabs.
         * Each tab stores its URL + full JSON response, so switching
         * tabs never requires another network request.
         */
        const TABS_STORAGE_KEY =
            "ps-pokepaste-tabs-v1";

        let pasteTabs = [];

        let activeTabId = null;

        let tabSequence = 0;

        let checkTimer = null;


        function getTeamBuilder() {

            return document.querySelector(
                "#room-teambuilder"
            );
        }
        function isTeambuilderActive() {

            const room =
                getTeamBuilder();


            if (!room)
                return false;


            /*
             * --------------------------------------------------------
             * 1. Must actually have a rendered rectangle.
             * --------------------------------------------------------
             */

            const rect =
                room.getBoundingClientRect();


            if (
                rect.width <= 0 ||
                rect.height <= 0
            ) {

                return false;
            }


            /*
             * --------------------------------------------------------
             * 2. Check computed visibility.
             * --------------------------------------------------------
             */

            const style =
                window.getComputedStyle(
                    room
                );


            if (
                style.display === "none" ||
                style.visibility === "hidden" ||
                style.visibility === "collapse"
            ) {

                return false;
            }


            if (
                parseFloat(
                    style.opacity
                ) === 0
            ) {

                return false;
            }


            /*
             * --------------------------------------------------------
             * 3. Showdown room state.
             *
             * Depending on the current client version, the active
             * room may be represented by a class on the room itself
             * or by the room's parent/tab state.
             * --------------------------------------------------------
             */

            const className =
                String(
                    room.className || ""
                );


            const hasInactiveClass =
                /\b(?:ps-room-hidden|room-hidden|inactive|hidden)\b/
                .test(
                    className
                );


            if (
                hasInactiveClass
            ) {

                return false;
            }


            /*
             * --------------------------------------------------------
             * 4. If another normal .ps-room is covering the same
             * viewport, Teambuilder isn't the active room.
             *
             * Our own PokéPaste room is excluded.
             * --------------------------------------------------------
             */

            const rooms =
                Array.from(
                    document.querySelectorAll(
                        ".ps-room"
                    )
                )
                .filter(
                    other =>
                    other !== room &&
                    other.id !==
                    POKEPASTE_ROOM_ID
                );


            /*
             * Find a visible room that is occupying the main
             * application viewport.
             */

            for (
                const other of rooms
            ) {

                const otherStyle =
                    window.getComputedStyle(
                        other
                    );


                if (
                    otherStyle.display ===
                    "none" ||
                    otherStyle.visibility ===
                    "hidden"
                ) {

                    continue;
                }


                const otherRect =
                    other.getBoundingClientRect();


                if (
                    otherRect.width <= 0 ||
                    otherRect.height <= 0
                ) {

                    continue;
                }


                /*
                 * If another room completely covers the same
                 * top-level area and is above Teambuilder,
                 * Teambuilder is not the active room.
                 */

                const coversSameArea =
                    otherRect.left <=
                    rect.left + 2 &&
                    otherRect.top <=
                    rect.top + 2 &&
                    otherRect.right >=
                    rect.right - 2 &&
                    otherRect.bottom >=
                    rect.bottom - 2;


                if (
                    coversSameArea
                ) {

                    const roomZ =
                        parseInt(
                            style.zIndex
                        ) || 0;


                    const otherZ =
                        parseInt(
                            otherStyle.zIndex
                        ) || 0;


                    if (
                        otherZ >
                        roomZ
                    ) {

                        return false;
                    }
                }
            }


            /*
             * --------------------------------------------------------
             * 5. Check Teambuilder's own tab if available.
             * --------------------------------------------------------
             */

            const tab =
                document.querySelector(
                    `[aria-controls="room-teambuilder"]`
                );


            if (tab) {

                const tabStyle =
                    window.getComputedStyle(
                        tab
                    );


                const tabClass =
                    String(
                        tab.className || ""
                    );


                if (
                    /\bactive\b/.test(
                        tabClass
                    ) ||
                    tab.getAttribute(
                        "aria-selected"
                    ) === "true"
                ) {

                    return true;
                }
            }


            /*
             * --------------------------------------------------------
             * The room is rendered and not hidden.
             *
             * This is the fallback for the classic Showdown client.
             * --------------------------------------------------------
             */

            return true;
        }


        // ============================================================
        // CREATE SEPARATE POKEPASTE ROOM
        // ============================================================

        function createPokepasteRoom() {

            let existing =
                document.getElementById(
                    POKEPASTE_ROOM_ID
                );


            if (existing)
                return;
            /*
             * Completely separate from Teambuilder.
             */

            const room =
                document.createElement(
                    "div"
                );


            room.id =
                POKEPASTE_ROOM_ID;


            room.className =
                "ps-room ps-room-light scrollable";


            room.innerHTML = `

            <div class="ps-pp-tabs"></div>

            <div class="ps-pp-toolbar">

                <div
                    class="ps-pp-toolbar-title"
                    title="PokéPaste"
                >
                    PokéPaste
                </div>

                <input
                    class="ps-pp-url"
                    type="text"
                    placeholder="Paste PokéPaste URL..."
                    autocomplete="off"
                    spellcheck="false"
                >
<button
                    class="ps-pp-load"
                    type="button"
                >
                    Load
                </button>

                <button
                    class="ps-pp-add"
                    type="button"
                    disabled
                >
                    Add
                </button>

                <button
                    class="ps-pp-copy"
                    type="button"
                    disabled
                >
                    Copy
                </button>

                <button
                    class="ps-pp-share"
                    type="button"
                    disabled
                >
                    Share
                </button>

            </div>


            <div class="ps-pp-content">

                <div class="ps-pp-welcome">

                    <div class="ps-pp-welcome-title">
                        PokéPaste Viewer
                    </div>

                    <div class="ps-pp-welcome-text">
                        Paste a PokéPaste link
                        to load it automatically.
                    </div>

                </div>

            </div>

        `;


            /*
             * BODY LEVEL.
             *
             * It is NOT appended to #room-teambuilder.
             */

            document.body.appendChild(
                room
            );


            const input =
                room.querySelector(
                    ".ps-pp-url"
                );
            const copy =
                room.querySelector(
                    ".ps-pp-copy"
                );


            const load =
                room.querySelector(
                    ".ps-pp-load"
                );

            const share =
                room.querySelector(
                    ".ps-pp-share"
                );

            const add =
                room.querySelector(
                    ".ps-pp-add"
                );


            /*
             * Restore/create the tab set before wiring the controls.
             */
            initializePasteTabs(
                input,
                copy
            );


            /*
             * RESTORED ORIGINAL LOAD BEHAVIOR.
             *
             * Load only loads the URL into the currently selected
             * PokéPaste tab. It does NOT create another tab and it
             * does NOT navigate to Teambuilder.
             */
            load.addEventListener(
                "click",
                () => {

                    loadPaste(
                        input.value.trim()
                    );

                }
            );


            /*
             * Pasting a valid PokéPaste URL automatically loads it
             * into the CURRENT tab. It does NOT create a new tab.
             */
            input.addEventListener(
                "paste",
                () => {

                    setTimeout(
                        () => {

                            const url =
                                input.value.trim();

                            if (
                                getPasteID(url)
                            ) {

                                loadPaste(
                                    url
                                );
                            }

                        },
                        0
                    );
                }
            );


            input.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        loadPaste(
                            input.value.trim()
                        );
                    }

                }
            );


            copy.addEventListener(
                "click",
                copyPaste
            );


            load.addEventListener(
                "click",
                loadPaste
            );


            add.addEventListener(
                "click",
                () => {

                    addPasteAsNewTeam();

                }
            );


            share.addEventListener(
                "click",
                sharePaste
            );


            renderPasteTabs();
            syncActiveTabUI();
        }


        // ============================================================
        // REMOVE ROOM
        // ============================================================

        function removePokepasteRoom() {

            const room =
                document.getElementById(
                    POKEPASTE_ROOM_ID
                );


            if (room) {

                room.remove();

            }
        }


        // ============================================================
        // CHECK ACTIVE STATE
        // ============================================================
        let wasTeambuilderActive =
            false;



        async function loadAllSavedPokepasteTabs() {

            /*
             * This runs only when we ENTER the Teambuilder room.
             * It restores every saved PokéPaste tab and fetches any
             * tab whose URL is saved but whose parsed data is missing.
             *
             * Already-loaded tabs are not fetched again.
             */
            const savedTabs =
                pasteTabs
                .filter(
                    tab =>
                    tab &&
                    tab.url
                )
                .map(
                    tab => ({
                        id: tab.id,

                        url: tab.url,

                        hasData:
                            !!(
                                tab.data &&
                                tab.data.paste
                            )
                    })
                );


            if (!savedTabs.length)
                return;


            for (
                const savedTab of savedTabs
            ) {

                if (
                    savedTab.hasData
                ) {
                    continue;
                }


                /*
                 * Do not change the visible tab while restoring
                 * background tabs.
                 */
                const id =
                    getPasteID(
                        savedTab.url
                    );

                if (!id)
                    continue;


                await new Promise(
                    resolve => {

                        requestJSON(
                            `https://pokepast.es/${id}/json`,

                            response => {

                                try {

                                    const data =
                                        JSON.parse(
                                            response
                                        );


                                    const tab =
                                        pasteTabs.find(
                                            item =>
                                            item.id ===
                                            savedTab.id
                                        );


                                    if (
                                        tab &&
                                        data &&
                                        typeof data.paste ===
                                        "string"
                                    ) {

                                        tab.data =
                                            data;

                                        tab.name =
                                            getTabDisplayName(
                                                tab
                                            );

                                    }

                                } catch {}


                                resolve();

                            },

                            () => {

                                resolve();

                            }
                        );

                    }
                );
            }


            savePasteTabs();

            renderPasteTabs();

            syncActiveTabUI();


            /*
             * Restore the currently selected tab visually, just like
             * pressing Load on that tab.
             */
            const active =
                getActivePasteTab();

            if (
                active &&
                active.data &&
                active.data.paste
            ) {

                lastPasteData =
                    active.data;

                renderPaste(
                    active.data
                );

            }
        }


        function checkTeambuilder() {

            const active =
                isTeambuilderActive();


            if (active) {

                createPokepasteRoom();


                /*
                 * Only run the full restore when we actually ENTER
                 * Teambuilder. MutationObserver can fire hundreds of
                 * times while the room is open, so we must not reload
                 * the same pastes repeatedly.
                 */
                if (
                    !wasTeambuilderActive
                ) {

                    wasTeambuilderActive =
                        true;


                    /*
                     * Restore every saved PokéPaste tab. This is
                     * effectively the same as pressing Load for every
                     * saved tab, but skips network requests for tabs
                     * whose data is already stored.
                     */
                    loadAllSavedPokepasteTabs();

                }


                /*
                 * If we arrived here from a clicked PokéPaste link,
                 * finish that pending load.
                 */
                processPendingPokepaste();

            } else {

                if (
                    wasTeambuilderActive
                ) {

                    wasTeambuilderActive =
                        false;
                }


                removePokepasteRoom();

            }
        }



        // ============================================================
        // SCHEDULE CHECK
        // ============================================================

        function scheduleCheck() {

            if (
                checkTimer
            ) {

                return;
            }


            checkTimer =
                setTimeout(
                    () => {

                        checkTimer =
                            null;

                        checkTeambuilder();

                    },
                    40
                );
        }


        // ============================================================
        // OBSERVER
        // ============================================================

        const observer =
            new MutationObserver(
                () => {

                    scheduleCheck();

                }
            );


        observer.observe(
            document.body, {

                childList: true,

                subtree: true,

                attributes: true,

                attributeFilter: [
                    "class",
                    "style",
                    "aria-selected"
                ]

            }
        );



        // ============================================================
        // POKEPASTE LINKS -> TEAMBUILDER
        // ============================================================

        function isPokepasteLink(url) {

            try {

                const parsed =
                    new URL(
                        url,
                        location.href
                    );

                const host =
                    parsed.hostname.toLowerCase();

                return (
                    (
                        host === "pokepast.es" ||
                        host === "www.pokepast.es"
                    ) &&
                    parsed.pathname
                    .split("/")
                    .filter(Boolean)
                    .length > 0
                );

            } catch {

                return false;
            }
        }


        function getClickedPokepaste(event) {

            if (
                event.defaultPrevented ||
                event.button !== 0 ||
                event.ctrlKey ||
                event.metaKey ||
                event.shiftKey ||
                event.altKey
            ) {
                return null;
            }

            const target =
                event.target;

            if (
                !target ||
                !target.closest
            ) {
                return null;
            }

            const anchor =
                target.closest("a[href]");

            if (!anchor)
                return null;

            /*
             * PokéPaste links are intentionally intercepted even when
             * Showdown marks them target="_blank".  Otherwise the browser
             * can leave the client before our importer gets a chance.
             *
             * Keep download links untouched.
             */
            if (
                anchor.hasAttribute("download")
            ) {
                return null;
            }

            const href =
                anchor.href ||
                anchor.getAttribute("href");

            return isPokepasteLink(href) ?
                href :
                null;
        }


        function visibleElement(element) {

            if (!element)
                return false;

            const style =
                getComputedStyle(element);

            const rect =
                element.getBoundingClientRect();

            return (
                style.display !== "none" &&
                style.visibility !== "hidden" &&
                rect.width > 0 &&
                rect.height > 0
            );
        }


        function findTextButton(root, regex) {

            const elements =
                Array.from(
                    root.querySelectorAll(
                        "button, input[type=button], input[type=submit], .button"
                    )
                );

            return elements.find(
                element =>
                visibleElement(element) &&
                regex.test(
                    (
                        element.textContent ||
                        element.value ||
                        ""
                    ).trim()
                )
            ) || null;
        }


        function openTeambuilderForPaste() {

            try {

                if (
                    window.app &&
                    typeof window.app.focusRoom ===
                    "function"
                ) {

                    window.app.focusRoom(
                        "teambuilder"
                    );

                    return true;
                }

            } catch {}


            try {

                if (
                    window.app &&
                    typeof window.app.addRoom ===
                    "function"
                ) {

                    window.app.addRoom(
                        "teambuilder"
                    );

                    if (
                        typeof window.app.focusRoom ===
                        "function"
                    ) {
                        window.app.focusRoom(
                            "teambuilder"
                        );
                    }

                    return true;
                }

            } catch {}


            const tab =
                Array.from(
                    document.querySelectorAll(
                        "button, a, [role=tab]"
                    )
                ).find(
                    element =>
                    /teambuilder/i.test(
                        (
                            element.textContent ||
                            element.getAttribute("title") ||
                            element.getAttribute("aria-label") ||
                            ""
                        )
                    )
                );

            if (tab) {

                tab.click();

                return true;
            }

            return false;
        }


        async function waitForElement(
            getter,
            timeout = 4000
        ) {

            const start =
                Date.now();

            return new Promise(resolve => {

                const tick = () => {

                    const value =
                        getter();

                    if (value) {
                        resolve(value);
                        return;
                    }

                    if (
                        Date.now() - start >=
                        timeout
                    ) {
                        resolve(null);
                        return;
                    }

                    setTimeout(
                        tick,
                        80
                    );
                };

                tick();
            });
        }


        function findTeamBuilderImportButton() {

            const room =
                getTeamBuilder();

            if (!room)
                return null;

            return (
                findTextButton(
                    room,
                    /import\s*\/?\s*export/i
                ) ||
                findTextButton(
                    room,
                    /^import$/i
                )
            );
        }


        function findImportTextArea() {

            const elements =
                Array.from(
                    document.querySelectorAll(
                        "textarea"
                    )
                );

            return elements.find(
                element => {

                    if (
                        !visibleElement(element)
                    ) {
                        return false;
                    }

                    const text =
                        (
                            element.placeholder ||
                            element.getAttribute("aria-label") ||
                            element.className ||
                            ""
                        ).toLowerCase();

                    return (
                        /import|paste|team/.test(
                            text
                        ) ||
                        element.offsetWidth > 250
                    );
                }
            ) || null;
        }


        function setInputValue(
            element,
            value
        ) {

            const proto =
                element instanceof HTMLTextAreaElement ?
                HTMLTextAreaElement.prototype :
                HTMLInputElement.prototype;

            const descriptor =
                Object.getOwnPropertyDescriptor(
                    proto,
                    "value"
                );

            if (
                descriptor &&
                descriptor.set
            ) {
                descriptor.set.call(
                    element,
                    value
                );
            } else {
                element.value = value;
            }

            element.dispatchEvent(
                new Event(
                    "input", {
                        bubbles: true
                    }
                )
            );

            element.dispatchEvent(
                new Event(
                    "change", {
                        bubbles: true
                    }
                )
            );
        }


        function findImportConfirmButton() {

            const buttons =
                Array.from(
                    document.querySelectorAll(
                        "button, input[type=button], input[type=submit], .button"
                    )
                );

            return buttons.find(
                button => {

                    if (
                        !visibleElement(button)
                    ) {
                        return false;
                    }

                    const text =
                        (
                            button.textContent ||
                            button.value ||
                            ""
                        ).trim();

                    return /^import$/i.test(
                        text
                    );
                }
            ) || null;
        }


        // ============================================================
        // POKEPASTE LINK -> /TEAMBUILDER + CURRENT POKEPASTE TAB
        // ============================================================

        const PENDING_POKEPASTE_KEY =
            "ps-pokepaste-pending-link";


        function savePendingPokepaste(
            url
        ) {

            try {

                sessionStorage.setItem(
                    PENDING_POKEPASTE_KEY,
                    normalizeURL(url)
                );

            } catch {}

        }


        function getPendingPokepaste() {

            try {

                return sessionStorage.getItem(
                    PENDING_POKEPASTE_KEY
                ) || "";

            } catch {

                return "";
            }
        }


        function clearPendingPokepaste() {

            try {

                sessionStorage.removeItem(
                    PENDING_POKEPASTE_KEY
                );

            } catch {}
        }


        function processPendingPokepaste() {

            const url =
                getPendingPokepaste();

            if (!url)
                return;


            if (!getPasteID(url)) {

                clearPendingPokepaste();
                return;
            }


            const run = () => {

                const room =
                    document.getElementById(
                        POKEPASTE_ROOM_ID
                    );

                if (!room)
                    return false;


                const input =
                    room.querySelector(
                        ".ps-pp-url"
                    );

                if (!input)
                    return false;


                /*
                 * Consume the pending URL FIRST. The mutation observer
                 * can call this function repeatedly, so this guarantees
                 * one click = one new PokéPaste tab.
                 */
                clearPendingPokepaste();


                /*
                 * NEVER reuse the currently active PokéPaste.
                 * Create a fresh tab and make it active.
                 */
                createPasteTab();


                const newTab =
                    getActivePasteTab();

                if (!newTab)
                    return true;


                newTab.url =
                    normalizeURL(url);


                input.value =
                    url;


                input.dispatchEvent(
                    new Event(
                        "input", {
                            bubbles: true
                        }
                    )
                );


                savePasteTabs();

                renderPasteTabs();

                syncActiveTabUI();


                /*
                 * Automatically load the URL into this NEW tab.
                 */
                loadPaste(url);


                return true;
            };


            if (run())
                return;


            let attempts = 0;

            const timer =
                setInterval(
                    () => {

                        attempts++;

                        if (
                            run() ||
                            attempts >= 40
                        ) {

                            clearInterval(timer);

                        }

                    },
                    50
                );
        }


        function navigateToTeambuilderWithPokepaste(
            url
        ) {

            const normalized =
                normalizeURL(url);


            if (
                !getPasteID(normalized)
            ) {

                return false;
            }


            /*
             * Remember the clicked paste until the Teambuilder room
             * has been focused and our PokéPaste viewer exists.
             */
            savePendingPokepaste(
                normalized
            );


            /*
             * IMPORTANT:
             *
             * Do NOT use window.location.href here.
             *
             * Showdown is a single-page application. Its own room
             * manager can focus/open "teambuilder" without reloading
             * the entire page. This gives the same Teambuilder room
             * while keeping the current client state alive.
             */
            try {

                if (
                    window.app &&
                    typeof window.app.addRoom ===
                    "function"
                ) {

                    window.app.addRoom(
                        "teambuilder"
                    );

                }

            } catch (error) {

                console.debug(
                    "[PokéPaste] addRoom fallback:",
                    error
                );
            }


            try {

                if (
                    window.app &&
                    typeof window.app.focusRoom ===
                    "function"
                ) {

                    window.app.focusRoom(
                        "teambuilder"
                    );

                }

            } catch (error) {

                console.debug(
                    "[PokéPaste] focusRoom fallback:",
                    error
                );
            }


            /*
             * Some Showdown builds expose the Teambuilder as a normal
             * top navigation button instead of the app API. Use that
             * only as a fallback; it also stays inside the SPA.
             */
            if (
                !isTeambuilderActive()
            ) {

                const tab =
                    Array.from(
                        document.querySelectorAll(
                            "button, a, [role=tab]"
                        )
                    ).find(
                        element =>
                        /teambuilder/i.test(
                            (
                                element.textContent ||
                                element.getAttribute(
                                    "title"
                                ) ||
                                element.getAttribute(
                                    "aria-label"
                                ) ||
                                ""
                            )
                        )
                    );


                if (tab) {

                    try {

                        tab.click();

                    } catch {}

                }
            }


            /*
             * The room may be created asynchronously. Our normal
             * mutation observer will call checkTeambuilder(), but also
             * retry here so the clicked paste appears immediately.
             */
            let attempts =
                0;


            const timer =
                setInterval(
                    () => {

                        attempts++;


                        if (
                            isTeambuilderActive()
                        ) {

                            checkTeambuilder();
                            processPendingPokepaste();

                            clearInterval(
                                timer
                            );

                            return;
                        }


                        if (
                            attempts >= 60
                        ) {

                            clearInterval(
                                timer
                            );

                        }

                    },
                    50
                );


            return true;
        }




        // ============================================================
        // ADD CURRENT POKEPASTE AS A NEW SHOWDOWN TEAM
        // ============================================================

        function currentPokepasteURL() {

            const tab =
                getActivePasteTab();

            if (
                tab &&
                tab.url
            ) {
                return normalizeURL(tab.url);
            }

            const room =
                document.getElementById(
                    POKEPASTE_ROOM_ID
                );

            const input =
                room &&
                room.querySelector(
                    ".ps-pp-url"
                );

            return input ?
                normalizeURL(input.value) :
                "";
        }


        function setPSInputValue(
            element,
            value
        ) {

            const prototype =
                element instanceof HTMLTextAreaElement ?
                HTMLTextAreaElement.prototype :
                HTMLInputElement.prototype;

            const descriptor =
                Object.getOwnPropertyDescriptor(
                    prototype,
                    "value"
                );

            if (
                descriptor &&
                descriptor.set
            ) {
                descriptor.set.call(
                    element,
                    value
                );
            } else {
                element.value = value;
            }

            element.dispatchEvent(
                new Event(
                    "input", {
                        bubbles: true
                    }
                )
            );

            element.dispatchEvent(
                new Event(
                    "change", {
                        bubbles: true
                    }
                )
            );
        }


        function psVisible(element) {

            if (!element)
                return false;

            const style =
                getComputedStyle(element);

            const rect =
                element.getBoundingClientRect();

            return (
                style.display !== "none" &&
                style.visibility !== "hidden" &&
                rect.width > 0 &&
                rect.height > 0
            );
        }


        function psButton(
            root,
            regex
        ) {

            if (!root)
                return null;

            return Array.from(
                root.querySelectorAll(
                    "button, input[type=button], input[type=submit], .button"
                )
            ).find(
                control =>
                psVisible(control) &&
                regex.test(
                    (
                        control.textContent ||
                        control.value ||
                        ""
                    ).trim()
                )
            ) || null;
        }


        function getNativeTeamName() {

            const tab =
                getActivePasteTab();

            const data =
                tab && tab.data ?
                tab.data :
                null;

            const title =
                data && data.title ?
                String(data.title).trim() :
                (
                    tab &&
                    tab.name &&
                    tab.name !== "New PokéPaste" ?
                    String(tab.name).trim() :
                    "PokéPaste Team"
                );

            const author =
                data && data.author ?
                String(data.author).trim() :
                "";

            return author ?
                `${title} ( BY ${author} )` :
                title;
        }


        function fetchPokepasteRawForAdd(url) {

            const id =
                getPasteID(url);

            if (!id) {
                return Promise.reject(
                    new Error(
                        "Invalid PokéPaste URL."
                    )
                );
            }

            return new Promise(
                (resolve, reject) => {

                    requestJSON(
                        `https://pokepast.es/${id}/raw`,

                        response => {

                            const raw =
                                String(
                                    response || ""
                                ).trim();

                            if (raw) {
                                resolve(raw);
                            } else {
                                reject(
                                    new Error(
                                        "PokéPaste returned an empty team."
                                    )
                                );
                            }
                        },

                        error => {

                            reject(
                                new Error(
                                    error ||
                                    "Could not fetch PokéPaste."
                                )
                            );
                        }
                    );
                }
            );
        }


        async function addPasteAsNewTeam() {

            const button =
                document.querySelector(
                    `#${POKEPASTE_ROOM_ID} .ps-pp-add`
                );

            const url =
                currentPokepasteURL();

            if (!url)
                return;


            if (button) {

                button.disabled = true;
                button.textContent = "Adding...";

            }


            try {

                /*
                 * Fetch the exact raw Showdown export. This keeps
                 * every Pokémon, move, item, EV, IV, nature, form,
                 * gender, Tera type, etc.
                 */
                const raw =
                    await fetchPokepasteRawForAdd(
                        url
                    );


                const id =
                    getPasteID(url);

                if (!id)
                    throw new Error(
                        "Invalid PokéPaste URL."
                    );


                const data =
                    await new Promise(
                        (resolve, reject) => {

                            requestJSON(
                                `https://pokepast.es/${id}/json`,

                                response => {

                                    try {

                                        const parsed =
                                            typeof response ===
                                            "string" ?
                                            JSON.parse(
                                                response
                                            ) :
                                            response;

                                        resolve(
                                            parsed || {}
                                        );

                                    } catch (error) {

                                        reject(error);

                                    }

                                },

                                error => {

                                    reject(
                                        new Error(
                                            error ||
                                            "Could not read PokéPaste."
                                        )
                                    );

                                }
                            );

                        }
                    );


                /*
                 * Keep the viewer tab's parsed data.
                 */
                const tab =
                    getActivePasteTab();

                if (tab) {

                    tab.data =
                        data;

                    if (data.title) {

                        tab.name =
                            String(
                                data.title
                            ).trim();

                    }

                }


                /*
                 * Open Teambuilder without reloading Showdown.
                 */
                if (!isTeambuilderActive()) {

                    try {

                        window.app?.addRoom?.(
                            "teambuilder"
                        );

                        window.app?.focusRoom?.(
                            "teambuilder"
                        );

                    } catch {}

                    await waitForElement(
                        () =>
                        isTeambuilderActive() ?
                        getTeamBuilder() :
                        null,
                        5000
                    );

                }


                let room =
                    getTeamBuilder();

                if (!room)
                    throw new Error(
                        "Teambuilder is not available."
                    );


                /*
                 * If a team is already open, return to the team list.
                 */
                const currentEditor =
                    room.querySelector(
                        ".teamwrapper"
                    );

                if (currentEditor) {

                    const back =
                        currentEditor.querySelector(
                            'button[name="back"], button.back'
                        );

                    if (back) {

                        back.click();

                        await new Promise(
                            resolve =>
                            setTimeout(
                                resolve,
                                180
                            )
                        );

                    }

                }


                room =
                    getTeamBuilder();


                /*
                 * Create a genuinely new native Showdown team.
                 */
                const newTeamButton =
                    await waitForElement(
                        () =>
                        psButton(
                            room,
                            /^new\s+team$/i
                        ) ||
                        psButton(
                            room,
                            /new\s+team/i
                        ),
                        5000
                    );


                if (!newTeamButton)
                    throw new Error(
                        "New Team button not found."
                    );


                newTeamButton.click();


                /*
                 * Wait for the editor.
                 */
                let editor =
                    await waitForElement(
                        () => {

                            const current =
                                getTeamBuilder();

                            return (
                                    current &&
                                    current.querySelector(
                                        ".teamwrapper"
                                    )
                                ) ?
                                current :
                                null;

                        },
                        5000
                    );


                if (!editor)
                    throw new Error(
                        "New team editor did not open."
                    );


                /*
                 * Team name.
                 */
                const title =
                    data.title &&
                    String(
                        data.title
                    ).trim() ?
                    String(
                        data.title
                    ).trim() :
                    "PokéPaste Team";


                const author =
                    data.author &&
                    String(
                        data.author
                    ).trim() ?
                    String(
                        data.author
                    ).trim() :
                    "";


                const teamName =
                    author ?
                    `${title} ( BY ${author} )` :
                    title;


                const nameInput =
                    editor.querySelector(
                        "input.teamnameedit"
                    );


                if (nameInput) {

                    setPSInputValue(
                        nameInput,
                        teamName
                    );

                    nameInput.dispatchEvent(
                        new Event(
                            "blur", {
                                bubbles: true
                            }
                        )
                    );

                }


                /*
                 * ----------------------------------------------------
                 * USE SHOWDOWN'S OWN IMPORTER
                 * ----------------------------------------------------
                 *
                 * This is NOT the old fragile "Import/Export" toolbar
                 * path. We click the exact "Import from text or URL"
                 * control shown in the user's screenshot.
                 */
                const importFromText =
                    await waitForElement(
                        () =>
                        psButton(
                            editor,
                            /import\s+from\s+text\s+or\s+url/i
                        ) ||
                        psButton(
                            editor,
                            /import\s+from\s+text/i
                        ),
                        5000
                    );


                if (!importFromText)
                    throw new Error(
                        "Import from text or URL button not found."
                    );


                importFromText.click();


                /*
                 * Find the actual import textarea after the dialog
                 * opens. Search globally because Showdown may render
                 * the importer outside .teamwrapper.
                 */
                const area =
                    await waitForElement(
                        () =>
                        Array.from(
                            document.querySelectorAll(
                                "textarea"
                            )
                        )
                        .filter(
                            textarea =>
                            psVisible(
                                textarea
                            )
                        )
                        .sort(
                            (
                                a,
                                b
                            ) =>
                            (
                                b.offsetWidth *
                                b.offsetHeight
                            ) -
                            (
                                a.offsetWidth *
                                a.offsetHeight
                            )
                        )[0] || null,
                        5000
                    );


                if (!area)
                    throw new Error(
                        "Showdown import textarea not found."
                    );


                /*
                 * Put the complete export into the native textarea.
                 *
                 * We use the textarea's real setter + input event,
                 * without firing change. This avoids the re-render
                 * problem from the previous version.
                 */
                const textareaSetter =
                    Object.getOwnPropertyDescriptor(
                        HTMLTextAreaElement.prototype,
                        "value"
                    )?.set;


                if (textareaSetter) {

                    textareaSetter.call(
                        area,
                        raw
                    );

                } else {

                    area.value =
                        raw;

                }


                area.dispatchEvent(
                    new Event(
                        "input", {
                            bubbles: true
                        }
                    )
                );


                /*
                 * Let Showdown render its import controls.
                 */
                await new Promise(
                    resolve =>
                    setTimeout(
                        resolve,
                        250
                    )
                );


                /*
                 * Find the IMPORT action belonging to the importer.
                 * We deliberately exclude the main "Import from text or
                 * URL" launcher.
                 */
                const importAction =
                    await waitForElement(
                        () => {

                            const controls =
                                Array.from(
                                    document.querySelectorAll(
                                        "button, input[type=button], input[type=submit]"
                                    )
                                );

                            return controls.find(
                                control => {

                                    if (
                                        !psVisible(
                                            control
                                        )
                                    )
                                        return false;


                                    const label =
                                        (
                                            control.textContent ||
                                            control.value ||
                                            ""
                                        ).trim();


                                    if (
                                        !/^import$/i.test(
                                            label
                                        )
                                    )
                                        return false;


                                    /*
                                     * Prefer a control close to
                                     * the visible textarea.
                                     */
                                    const rect =
                                        control.getBoundingClientRect();

                                    const areaRect =
                                        area.getBoundingClientRect();

                                    return (
                                        Math.abs(
                                            rect.top -
                                            areaRect.top
                                        ) < 600
                                    );

                                }
                            ) || null;

                        },
                        5000
                    );


                if (!importAction)
                    throw new Error(
                        "Showdown Import action not found."
                    );


                /*
                 * Click the actual importer.
                 */
                importAction.click();


                /*
                 * Wait until Pokémon are actually present in the
                 * newly-created team. We don't accept an empty editor.
                 */
                editor =
                    await waitForElement(
                        () => {

                            const current =
                                getTeamBuilder();

                            if (!current)
                                return null;


                            const team =
                                current.querySelector(
                                    ".teamwrapper"
                                );

                            if (!team)
                                return null;


                            /*
                             * Different Showdown versions use different
                             * Pokémon-card classes. Count several known
                             * patterns, while also accepting the native
                             * "Remove Pokémon" buttons.
                             */
                            const pokemonNodes =
                                team.querySelectorAll(
                                    ".pokemon, .set, .team-pokemon, .pokemonicon"
                                );


                            const removeButtons =
                                team.querySelectorAll(
                                    'button[name="remove"], button[name="delete"]'
                                );


                            return (
                                    pokemonNodes.length ||
                                    removeButtons.length
                                ) ?
                                current :
                                null;

                        },
                        7000
                    );


                if (!editor)
                    throw new Error(
                        "PokéPaste was not imported into the team."
                    );


                /*
                 * Finally save the native team.
                 *
                 * Search the editor first, then the visible Teambuilder
                 * room for Showdown's normal Save button.
                 */
                const saveButton =
                    await waitForElement(
                        () => {

                            const roots = [
                                editor,
                                getTeamBuilder()
                            ].filter(Boolean);


                            for (
                                const root of roots
                            ) {

                                const candidate =
                                    psButton(
                                        root,
                                        /^save$/i
                                    ) ||
                                    root.querySelector(
                                        "button.savebutton"
                                    );


                                if (
                                    candidate &&
                                    psVisible(
                                        candidate
                                    )
                                ) {

                                    return candidate;

                                }

                            }


                            return null;

                        },
                        5000
                    );


                if (!saveButton)
                    throw new Error(
                        "Showdown Save button not found."
                    );


                saveButton.click();


                /*
                 * Allow Showdown's team storage/rendering to finish.
                 */
                await new Promise(
                    resolve =>
                    setTimeout(
                        resolve,
                        500
                    )
                );


                if (button) {

                    button.textContent =
                        "Added!";


                    setTimeout(
                        () => {

                            button.textContent =
                                "Add";

                            button.disabled =
                                false;

                        },
                        1200
                    );

                }

            } catch (error) {

                console.error(
                    "[PokéPaste] ADD:",
                    error
                );


                if (button) {

                    button.textContent =
                        "Add";

                    button.disabled =
                        false;

                }

            }

        }



        /*
         * Site-wide PokéPaste click interception.
         *
         * Clicking a PokéPaste link:
         *   1. prevents the external PokéPaste navigation;
         *   2. focuses/opens Showdown's /teambuilder room WITHOUT
         *      reloading the page;
         *   3. restores the URL into the CURRENT PokéPaste tab;
         *   4. automatically runs the normal viewer loader.
         */
        function getClickedPokepaste(
            event
        ) {

            if (
                event.defaultPrevented ||
                event.button !== 0 ||
                event.ctrlKey ||
                event.metaKey ||
                event.shiftKey ||
                event.altKey
            ) {

                return null;
            }


            const target =
                event.target;


            if (
                !target ||
                !target.closest
            ) {

                return null;
            }


            const anchor =
                target.closest(
                    "a[href]"
                );


            if (!anchor)
                return null;


            if (
                anchor.hasAttribute(
                    "download"
                )
            ) {

                return null;
            }


            const href =
                anchor.href ||
                anchor.getAttribute(
                    "href"
                );


            return isPokepasteLink(
                    href
                ) ?
                href :
                null;
        }


        function handlePokepasteSiteClick(
            event
        ) {

            const url =
                getClickedPokepaste(
                    event
                );


            if (!url)
                return;


            /*
             * Stop Showdown/browser from following the original
             * PokéPaste URL.
             */
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();


            navigateToTeambuilderWithPokepaste(
                url
            );
        }


        /*
         * Capture phase is important because Showdown chat links can
         * have their own click handlers.
         */
        document.addEventListener(
            "click",
            handlePokepasteSiteClick,
            true
        );


        document.addEventListener(
            "auxclick",
            event => {

                if (
                    event.button !== 1
                ) {

                    return;
                }


                const target =
                    event.target;


                const anchor =
                    target &&
                    target.closest ?
                    target.closest(
                        "a[href]"
                    ) :
                    null;


                if (!anchor)
                    return;


                const href =
                    anchor.href ||
                    anchor.getAttribute(
                        "href"
                    );


                if (
                    isPokepasteLink(
                        href
                    )
                ) {

                    event.preventDefault();
                    event.stopPropagation();

                }

            },
            true
        );


        // ============================================================
        // ALSO CHECK ON CLICK
        // ============================================================

        document.addEventListener(
            "click",
            () => {

                scheduleCheck();

            },
            true
        );


        // ============================================================
        // ALSO CHECK ON HASH / HISTORY CHANGES
        // ============================================================

        window.addEventListener(
            "popstate",
            scheduleCheck
        );


        window.addEventListener(
            "hashchange",
            scheduleCheck
        );


        // ============================================================
        // INITIALIZE
        // ============================================================
        scheduleCheck();

        /*
         * Finish a pending PokéPaste after a full /teambuilder
         * navigation.
         */
        setTimeout(
            () => {

                if (
                    isTeambuilderActive()
                ) {

                    checkTeambuilder();

                    processPendingPokepaste();

                }

            },
            250
        );




        // ============================================================
        // URL NORMALIZATION
        // ============================================================

        function normalizeURL(
            value
        ) {

            let url =
                String(
                    value || ""
                ).trim();


            url =
                url.replace(
                    /^["'`]+|["'`]+$/g,
                    ""
                );


            url =
                url.replace(
                    /[\\/]+$/g,
                    ""
                );


            if (
                /^pokepast\.es\//i.test(
                    url
                )
            ) {

                url =
                    "https://" +
                    url;
            }


            if (
                /^[A-Za-z0-9_-]+$/.test(
                    url
                )
            ) {

                url =
                    "https://pokepast.es/" +
                    url;
            }


            return url;
        }


        // ============================================================
        // GET PASTE ID
        // ============================================================
        function setupPokePasteSprites() {

            document
                .querySelectorAll(".ps-pp-sprite")
                .forEach(img => {

                    const name =
                        String(
                            img.alt || ""
                        )
                        .toLowerCase()
                        .replace(/[^a-z0-9]/g, "");

                    const zaSprite =
                        forcedMegaSprites[name];

                    if (
                        zaSprite &&
                        img.dataset.zaSpriteApplied !== "true"
                    ) {

                        img.src =
                            zaSprite;

                        img.dataset.zaSpriteApplied =
                            "true";

                        img.style.display =
                            "";
                    }

                });

        }

        function getPasteID(
            value
        ) {

            const url =
                normalizeURL(
                    value
                );


            let parsed;


            try {

                parsed =
                    new URL(
                        url
                    );

            } catch {

                return null;
            }


            const hostname =
                parsed.hostname
                .toLowerCase();


            if (
                hostname !==
                "pokepast.es" &&
                hostname !==
                "www.pokepast.es"
            ) {

                return null;
            }


            const parts =
                parsed.pathname
                .split("/")
                .filter(
                    Boolean
                );


            if (
                !parts.length
            ) {

                return null;
            }


            return parts[0]
                .replace(
                    /[^A-Za-z0-9_-]/g,
                    ""
                );
        }


        // ============================================================
        // REQUEST JSON
        // ============================================================

        function requestJSON(
            url,
            success,
            failure
        ) {

            if (
                typeof GM_xmlhttpRequest ===
                "function"
            ) {

                GM_xmlhttpRequest({

                    method: "GET",

                    url: url,

                    timeout: 15000,

                    headers: {

                        Accept: "application/json"

                    },


                    onload: response => {

                        if (
                            response.status >=
                            200 &&
                            response.status <
                            300
                        ) {

                            success(
                                response.responseText
                            );

                        } else {

                            failure(
                                `HTTP ${response.status}`
                            );
                        }

                    },


                    onerror: () => {

                        failure(
                            "Network request failed."
                        );
                    },


                    ontimeout: () => {

                        failure(
                            "Request timed out."
                        );
                    }

                });


                return;
            }


            if (
                typeof GM !==
                "undefined" &&
                typeof GM.xmlHttpRequest ===
                "function"
            ) {

                GM.xmlHttpRequest({

                    method: "GET",

                    url: url,

                    timeout: 15000,

                    headers: {

                        Accept: "application/json"

                    },


                    onload: response => {

                        if (
                            response.status >=
                            200 &&
                            response.status <
                            300
                        ) {

                            success(
                                response.responseText
                            );

                        } else {

                            failure(
                                `HTTP ${response.status}`
                            );
                        }

                    },


                    onerror: () => {

                        failure(
                            "Network request failed."
                        );
                    },


                    ontimeout: () => {

                        failure(
                            "Request timed out."
                        );
                    }

                });


                return;
            }


            fetch(url)
                .then(
                    response => {

                        if (
                            !response.ok
                        ) {

                            throw new Error(
                                `HTTP ${response.status}`
                            );
                        }


                        return response.text();

                    }
                )
                .then(
                    success
                )
                .catch(
                    error => {

                        failure(
                            error.message ||
                            "Request failed."
                        );

                    }
                );
        }



        // ============================================================
        // MULTI-POKEPASTE TABS
        // ============================================================

        function makeTabId() {

            tabSequence++;

            return (
                Date.now().toString(36) +
                "-" +
                tabSequence.toString(36)
            );
        }


        function createBlankPasteTab() {

            return {

                id: makeTabId(),

                url: "",

                data: null,

                name: "New PokéPaste"
            };
        }


        function getActivePasteTab() {

            return pasteTabs.find(
                tab =>
                tab.id ===
                activeTabId
            ) || null;
        }


        function savePasteTabs() {

            try {

                localStorage.setItem(
                    TABS_STORAGE_KEY,
                    JSON.stringify({
                        tabs: pasteTabs,
                        activeTabId: activeTabId
                    })
                );

            } catch {}
        }


        function getTabDisplayName(tab) {

            if (!tab)
                return "New PokéPaste";


            /*
             * Prefer the actual PokéPaste title.
             */
            if (
                tab.data &&
                tab.data.title
            ) {

                const title =
                    String(
                        tab.data.title
                    ).trim() ||
                    "PokéPaste";

                const author =
                    tab.data.author ?
                    String(
                        tab.data.author
                    ).trim() :
                    "";

                return author ?
                    `${title} (by ${author})` :
                    title;
            }


            /*
             * If there is no title, use the first useful
             * line from the paste.
             */
            if (
                tab.data &&
                typeof tab.data.paste ===
                "string"
            ) {

                const firstLine =
                    tab.data.paste
                    .replace(/\r/g, "")
                    .split("\n")
                    .map(
                        line =>
                        line.trim()
                    )
                    .find(Boolean);

                if (firstLine) {

                    const cleaned =
                        firstLine
                        .replace(
                            /\s+@\s+.*/,
                            ""
                        )
                        .trim();

                    if (cleaned) {

                        return cleaned
                            .slice(0, 26);
                    }
                }
            }


            return (
                tab.name ||
                "New PokéPaste"
            );
        }


        function renderPasteTabs() {

            const room =
                document.getElementById(
                    POKEPASTE_ROOM_ID
                );

            if (!room)
                return;


            const tabs =
                room.querySelector(
                    ".ps-pp-tabs"
                );

            if (!tabs)
                return;


            tabs.innerHTML = "";


            pasteTabs.forEach(
                tab => {

                    const tabButton =
                        document.createElement(
                            "div"
                        );

                    tabButton.className =
                        "ps-pp-tab" +
                        (
                            tab.id ===
                            activeTabId ?
                            " active" :
                            ""
                        );


                    const name =
                        document.createElement(
                            "span"
                        );

                    name.className =
                        "ps-pp-tab-name";

                    name.textContent =
                        getTabDisplayName(
                            tab
                        );

                    name.title =
                        getTabDisplayName(
                            tab
                        );


                    const close =
                        document.createElement(
                            "button"
                        );

                    close.className =
                        "ps-pp-tab-close";

                    close.type =
                        "button";

                    close.textContent =
                        "×";

                    close.title =
                        "Close PokéPaste";


                    /*
                     * Clicking the tab switches it.
                     * Clicking × only closes it.
                     */
                    tabButton.addEventListener(
                        "click",
                        () => {

                            switchPasteTab(
                                tab.id
                            );

                        }
                    );


                    close.addEventListener(
                        "click",
                        event => {

                            event.preventDefault();

                            event.stopPropagation();

                            closePasteTab(
                                tab.id
                            );

                        }
                    );


                    tabButton.appendChild(
                        name
                    );

                    tabButton.appendChild(
                        close
                    );

                    tabs.appendChild(
                        tabButton
                    );
                }
            );


            const add =
                document.createElement(
                    "button"
                );

            add.className =
                "ps-pp-tab-add";

            add.type =
                "button";

            add.textContent =
                "+";

            add.title =
                "New PokéPaste";


            add.addEventListener(
                "click",
                createPasteTab
            );


            tabs.appendChild(
                add
            );
        }


        function syncActiveTabUI() {

            const room =
                document.getElementById(
                    POKEPASTE_ROOM_ID
                );

            if (!room)
                return;


            const input =
                room.querySelector(
                    ".ps-pp-url"
                );

            const copy =
                room.querySelector(
                    ".ps-pp-copy"
                );

            const share =
                room.querySelector(
                    ".ps-pp-share"
                );

            const load =
                room.querySelector(
                    ".ps-pp-load"
                );

            const add =
                room.querySelector(
                    ".ps-pp-add"
                );

            const toolbarTitle =
                room.querySelector(
                    ".ps-pp-toolbar-title"
                );

            const tab =
                getActivePasteTab();


            if (toolbarTitle) {

                const title =
                    getTabDisplayName(
                        tab
                    );

                toolbarTitle.textContent =
                    title;

                toolbarTitle.title =
                    title;
            }


            if (input) {

                input.value =
                    tab &&
                    tab.url ?
                    tab.url :
                    "";
            }


            if (copy) {

                copy.disabled = !(
                    tab &&
                    tab.data &&
                    tab.data.paste
                );
            }



            if (share) {

                share.disabled = !(tab && tab.url);
            }

            if (load) {

                load.disabled = !(tab && tab.url);
            }


            if (add) {

                add.disabled = !(tab && tab.url);
            }

            lastPasteData =
                tab &&
                tab.data ?
                tab.data :
                null;
        }


        function initializePasteTabs(
            input,
            copy
        ) {

            pasteTabs = [];

            activeTabId =
                null;


            /*
             * First try the multi-tab storage.
             */
            try {

                const saved =
                    localStorage.getItem(
                        TABS_STORAGE_KEY
                    );

                if (saved) {

                    const parsed =
                        JSON.parse(
                            saved
                        );

                    if (
                        parsed &&
                        Array.isArray(
                            parsed.tabs
                        ) &&
                        parsed.tabs.length
                    ) {

                        pasteTabs =
                            parsed.tabs.filter(
                                tab =>
                                tab &&
                                tab.id
                            );

                        activeTabId =
                            parsed.activeTabId ||
                            null;
                    }
                }

            } catch {}


            /*
             * Backward compatibility with the old single-paste
             * storage used by previous versions.
             */
            if (
                !pasteTabs.length
            ) {

                try {

                    const old =
                        localStorage.getItem(
                            STORAGE_KEY
                        );

                    if (old) {

                        const parsed =
                            JSON.parse(
                                old
                            );

                        if (
                            parsed &&
                            parsed.data &&
                            parsed.data.paste
                        ) {

                            const tab =
                                createBlankPasteTab();

                            tab.url =
                                parsed.url ||
                                "";

                            tab.data =
                                parsed.data;

                            tab.name =
                                getTabDisplayName(
                                    tab
                                );

                            pasteTabs.push(
                                tab
                            );

                            activeTabId =
                                tab.id;
                        }

                    }

                } catch {}
            }


            if (
                !pasteTabs.length
            ) {

                const tab =
                    createBlankPasteTab();

                pasteTabs.push(
                    tab
                );

                activeTabId =
                    tab.id;
            }


            if (
                !pasteTabs.some(
                    tab =>
                    tab.id ===
                    activeTabId
                )
            ) {

                activeTabId =
                    pasteTabs[0].id;
            }


            savePasteTabs();

            syncActiveTabUI();
        }


        function createPasteTab() {

            /*
             * Save the current tab before creating a new one.
             */
            const current =
                getActivePasteTab();

            if (current) {

                const room =
                    document.getElementById(
                        POKEPASTE_ROOM_ID
                    );

                const input =
                    room &&
                    room.querySelector(
                        ".ps-pp-url"
                    );

                if (input) {

                    current.url =
                        input.value.trim();
                }
            }


            const tab =
                createBlankPasteTab();

            pasteTabs.push(
                tab
            );

            activeTabId =
                tab.id;

            lastPasteData =
                null;

            savePasteTabs();

            renderPasteTabs();

            syncActiveTabUI();

            showWelcome();
        }


        function switchPasteTab(id) {

            if (
                !pasteTabs.some(
                    tab =>
                    tab.id === id
                )
            ) {
                return;
            }


            const room =
                document.getElementById(
                    POKEPASTE_ROOM_ID
                );

            const current =
                getActivePasteTab();

            const input =
                room &&
                room.querySelector(
                    ".ps-pp-url"
                );


            if (
                current &&
                input
            ) {

                current.url =
                    input.value.trim();
            }


            activeTabId =
                id;


            const tab =
                getActivePasteTab();


            lastPasteData =
                tab &&
                tab.data ?
                tab.data :
                null;


            savePasteTabs();

            renderPasteTabs();

            syncActiveTabUI();


            if (
                tab &&
                tab.data &&
                tab.data.paste
            ) {

                renderPaste(
                    tab.data
                );

            } else {

                showWelcome();
            }
        }


        function closePasteTab(id) {

            const index =
                pasteTabs.findIndex(
                    tab =>
                    tab.id === id
                );

            if (index < 0)
                return;


            const wasActive =
                id ===
                activeTabId;


            pasteTabs.splice(
                index,
                1
            );


            /*
             * Never allow zero tabs: closing the final tab creates
             * a fresh empty tab, exactly like a browser.
             */
            if (
                !pasteTabs.length
            ) {

                const tab =
                    createBlankPasteTab();

                pasteTabs.push(
                    tab
                );

                activeTabId =
                    tab.id;
            } else if (wasActive) {

                /*
                 * Browser-like behavior: select the tab immediately
                 * to the left, otherwise the first remaining tab.
                 */
                const nextIndex =
                    Math.max(
                        0,
                        Math.min(
                            index - 1,
                            pasteTabs.length - 1
                        )
                    );

                activeTabId =
                    pasteTabs[
                        nextIndex
                    ].id;
            }


            const active =
                getActivePasteTab();

            lastPasteData =
                active &&
                active.data ?
                active.data :
                null;


            savePasteTabs();

            renderPasteTabs();

            syncActiveTabUI();


            if (
                active &&
                active.data &&
                active.data.paste
            ) {

                renderPaste(
                    active.data
                );

            } else {

                showWelcome();
            }
        }


        // ============================================================
        // LOAD PASTE
        // ============================================================
        const POKEPASTE_404_HTML = `
    <div class="ps-pp-404">

        <div class="ps-pp-404-image">
            <img
                src="https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/404-error.gif"
                alt="404"
            >
        </div>

        <div class="ps-pp-404-txt">
            Oops! A wild Snorlax has blocked your path.
        </div>

        <div class="ps-pp-404-title">
            ( PokéPaste Not Found )
        </div>

        <div class="ps-pp-404-buttons">

            <button
                type="button"
                class="ps-pp-force button big"
            >
                Push him away!
            </button>

            <button
                type="button"
                class="ps-pp-home button big"
            >
                Go Back Home!
            </button>

        </div>

    </div>
`;

        function attachPokepaste404Events(content) {

            const force =
                content.querySelector(".ps-pp-force");

            const home =
                content.querySelector(".ps-pp-home");

            force?.addEventListener("click", () => {

                content.innerHTML = `
            <div class="ps-pp-force-image">
                <video
                    autoplay
                    loop
                    playsinline
                    src="https://cdn-useast1.kapwing.com/static/templates/rick-roll-video-meme-template-video-1da252ec.mp4">
                </video>
            </div>
        `;

            });

            home?.addEventListener("click", () => {

                const input =
                    document.querySelector(
                        `#${POKEPASTE_ROOM_ID} .ps-pp-url`
                    );

                if (input)
                    input.value = "";

                loadPaste("");

                const homeRoom =
                    document.querySelector(
                        ".ps-room[roomid='home']"
                    );

                if (homeRoom) {

                    homeRoom.click();

                } else if (
                    window.app &&
                    typeof window.app.focusRoom === "function"
                ) {

                    window.app.focusRoom("home");

                }

            });
        }

        function loadPaste(
            value
        ) {

            const content =
                document.querySelector(
                    `#${POKEPASTE_ROOM_ID} .ps-pp-content`
                );


            const load =
                document.querySelector(
                    `#${POKEPASTE_ROOM_ID} .ps-pp-load`
                );


            const copy =
                document.querySelector(
                    `#${POKEPASTE_ROOM_ID} .ps-pp-copy`
                );


            if (!content)
                return;


            const activeTab =
                getActivePasteTab();


            /*
             * Empty URL = manually remove the current tab's
             * loaded PokéPaste, while keeping the tab itself.
             */
            if (
                !String(
                    value || ""
                ).trim()
            ) {

                if (activeTab) {

                    activeTab.url =
                        "";

                    activeTab.data =
                        null;

                    activeTab.name =
                        "New PokéPaste";
                }


                lastPasteData =
                    null;


                savePasteTabs();

                renderPasteTabs();

                syncActiveTabUI();


                if (copy)
                    copy.disabled =
                    true;


                const addButton =
                    document.querySelector(
                        `#${POKEPASTE_ROOM_ID} .ps-pp-add`
                    );

                if (addButton)
                    addButton.disabled =
                    true;


                showWelcome();

                return;
            }


            const requestTabId =
                activeTabId;


            const id =
                getPasteID(
                    value
                );


            if (!id) {

                content.innerHTML =
                    POKEPASTE_404_HTML;

                attachPokepaste404Events(content);
                return;
            }


            showStatus(
                "Loading PokéPaste..."
            );


            if (load)
                load.disabled =
                true;


            const requestURL =
                `https://pokepast.es/${id}/json`;


            requestJSON(

                requestURL,

                responseText => {

                    if (load)
                        load.disabled =
                        false;


                    let data;


                    try {

                        data =
                            JSON.parse(
                                responseText
                            );

                    } catch {

                        showStatus(
                            "PokéPaste returned invalid JSON.",
                            true
                        );


                        return;
                    }


                    if (
                        !data ||
                        typeof data.paste !==
                        "string"
                    ) {

                        showStatus(
                            "PokéPaste did not contain readable team data.",
                            true
                        );


                        return;
                    }


                    /*
                     * The user may have switched/closed the tab while
                     * the request was in flight. Only write the result
                     * into the tab that initiated this request.
                     */
                    const currentTab =
                        pasteTabs.find(
                            tab =>
                            tab.id ===
                            requestTabId
                        );


                    if (!currentTab) {
                        return;
                    }


                    activeTabId =
                        requestTabId;


                    lastPasteData =
                        data;


                    getActivePasteTab();


                    if (currentTab) {

                        currentTab.url =
                            normalizeURL(
                                value
                            );

                        currentTab.data =
                            data;

                        currentTab.name =
                            getTabDisplayName(
                                currentTab
                            );
                    }


                    savePasteTabs();

                    renderPasteTabs();


                    if (copy)
                        copy.disabled =
                        false;


                    const addButton =
                        document.querySelector(
                            `#${POKEPASTE_ROOM_ID} .ps-pp-add`
                        );

                    if (addButton)
                        addButton.disabled =
                        false;


                    const shareButton =
                        document.querySelector(
                            `#${POKEPASTE_ROOM_ID} .ps-pp-share`
                        );

                    if (shareButton)
                        shareButton.disabled = !currentTab.url;


                    renderPaste(
                        data
                    );

                },


                error => {
                    if (load)
                        load.disabled = false;

                    content.innerHTML = POKEPASTE_404_HTML;

                    attachPokepaste404Events(content);
                }

            );
        }


        // ============================================================
        // SAVE
        // ============================================================

        function savePaste(
            url,
            data
        ) {

            try {

                localStorage.setItem(

                    STORAGE_KEY,

                    JSON.stringify({

                        url: url,

                        data: data

                    })

                );

            } catch {}
        }


        // ============================================================
        // CLEAR SAVE
        // ============================================================

        function clearSavedPaste() {

            const active =
                getActivePasteTab();

            if (active) {

                active.url =
                    "";

                active.data =
                    null;

                active.name =
                    "New PokéPaste";
            }


            lastPasteData =
                null;


            savePasteTabs();


            /*
             * Remove the legacy single-paste key too.
             */
            try {

                localStorage.removeItem(
                    STORAGE_KEY
                );

            } catch {}


            renderPasteTabs();

            syncActiveTabUI();
        }



        // ============================================================
        // RESTORE
        // ============================================================

        function restoreSavedPaste(
            input,
            copy
        ) {

            /*
             * Kept as a compatibility wrapper for older code paths.
             * The real restoration is performed by initializePasteTabs().
             */
            initializePasteTabs(
                input,
                copy
            );

            renderPasteTabs();

            syncActiveTabUI();


            const active =
                getActivePasteTab();

            if (
                active &&
                active.data &&
                active.data.paste
            ) {

                renderPaste(
                    active.data
                );

            }
        }



        // ============================================================
        // WELCOME
        // ============================================================

        function showWelcome() {

            const content =
                document.querySelector(
                    `#${POKEPASTE_ROOM_ID} .ps-pp-content`
                );


            if (!content)
                return;


            content.innerHTML = `

            <div class="ps-pp-welcome">

                <div class="ps-pp-welcome-title">
                    PokéPaste Viewer
                </div>

                <div class="ps-pp-welcome-text">
                    Paste a PokéPaste link
                    and click Load.
                </div>

            </div>

        `;
        }


        // ============================================================
        // STATUS
        // ============================================================

        function showStatus(
            message,
            error = false
        ) {

            const content =
                document.querySelector(
                    `#${POKEPASTE_ROOM_ID} .ps-pp-content`
                );


            if (!content)
                return;


            content.innerHTML =
                "";


            const status =
                document.createElement(
                    "div"
                );


            status.className =
                "ps-pp-status";


            if (error) {

                status.classList.add(
                    "ps-pp-error"
                );
            }


            status.textContent =
                message;


            content.appendChild(
                status
            );
        }


        // ============================================================
        // PARSE PASTE
        // ============================================================

        function parsePaste(
            text
        ) {

            const clean =
                String(
                    text || ""
                )
                .replace(
                    /\r/g,
                    ""
                )
                .trim();


            if (!clean)
                return [];


            /*
             * No six-Pokemon restriction.
             */

            return clean
                .split(
                    /\n\s*\n/
                )
                .map(
                    parsePokemon
                )
                .filter(
                    Boolean
                );
        }


        // ============================================================
        // PARSE POKEMON
        // ============================================================

        function parsePokemon(
            block
        ) {

            const lines =
                block
                .split("\n")
                .map(
                    line =>
                    line.trim()
                )
                .filter(
                    Boolean
                );


            if (!lines.length)
                return null;


            let first =
                lines.shift();


            let item =
                "";


            /*
             * Item.
             */

            const itemIndex =
                first.indexOf(
                    " @ "
                );


            if (
                itemIndex !== -1
            ) {

                item =
                    first
                    .slice(
                        itemIndex + 3
                    )
                    .trim();


                first =
                    first
                    .slice(
                        0,
                        itemIndex
                    )
                    .trim();
            }


            /*
             * Gender.
             *
             * Example:
             *
             * Pikachu (M)
             * Pikachu (F)
             */

            let gender =
                null;


            const genderMatch =
                first.match(
                    /\s+\(([MF])\)\s*$/
                );


            if (
                genderMatch
            ) {

                gender =
                    genderMatch[1];


                first =
                    first
                    .replace(
                        /\s+\([MF]\)\s*$/,
                        ""
                    )
                    .trim();
            }


            /*
             * Nickname / species.
             *
             * Example:
             *
             * My Pika (Pikachu)
             */

            let nickname =
                "";


            let species =
                first;


            const nicknameMatch =
                first.match(
                    /^(.+?)\s+\(([^()]+)\)$/
                );


            if (
                nicknameMatch
            ) {

                nickname =
                    nicknameMatch[1]
                    .trim();


                species =
                    nicknameMatch[2]
                    .trim();
            }


            const pokemon = {

                nickname: nickname,

                species: species,

                item: item,

                gender: gender,

                fields: [],

                moves: []

            };


            /*
             * Remaining lines.
             */

            lines.forEach(
                line => {

                    /*
                     * Move.
                     */

                    if (
                        line.startsWith(
                            "-"
                        )
                    ) {

                        pokemon.moves.push(
                            line
                            .slice(1)
                            .trim()
                        );


                        return;
                    }


                    /*
                     * Field.
                     */

                    const colon =
                        line.indexOf(
                            ":"
                        );


                    if (
                        colon > 0
                    ) {

                        pokemon.fields.push({

                            key: line
                                .slice(
                                    0,
                                    colon
                                )
                                .trim(),

                            value: line
                                .slice(
                                    colon + 1
                                )
                                .trim()

                        });


                        return;
                    }


                    pokemon.fields.push({

                        key: "",

                        value: line

                    });

                }
            );


            return pokemon;
        }


        // ============================================================
        // SPRITE NAME NORMALIZATION
        // ============================================================

        function normalizeSpriteName(
            value
        ) {

            return String(
                    value || ""
                )
                .toLowerCase()
                .trim()
                .replace(
                    /['’]/g,
                    ""
                )
                .replace(
                    /[.:]/g,
                    ""
                )
                .replace(
                    /[_\s]+/g,
                    "-"
                )
                .replace(
                    /[^a-z0-9-]/g,
                    ""
                )
                .replace(
                    /-+/g,
                    "-"
                )
                .replace(
                    /^-|-$/g,
                    ""
                );
        }


        // ============================================================
        // SPRITE CANDIDATES
        //
        // Showdown uses form-specific filenames in gen5:
        //
        // pokemon.png
        // pokemon-f.png
        // pokemon-mega.png
        // pokemon-megax.png
        // pokemon-megay.png
        // pokemon-gmax.png
        // pokemon-hisui.png
        // pokemon-galar.png
        // etc.
        //
        // ============================================================

        function getSpriteCandidates(pokemon) {

            const species =
                normalizeSpriteName(
                    pokemon?.species || ""
                );

            const candidates = [];

            function add(name) {

                if (
                    name &&
                    !candidates.includes(name)
                ) {
                    candidates.push(name);
                }
            }


            add(species);


            const megaAliases = {

                "raichu-mega-x": "raichumegax",
                "raichu-mega-y": "raichumegay",

                "clefable-mega": "clefablemega",
                "victreebel-mega": "victreebelmega",
                "starmie-mega": "starmiemega",
                "dragonite-mega": "dragonitemega",
                "meganium-mega": "meganiummega",
                "feraligatr-mega": "feraligatrmega",
                "skarmory-mega": "skarmorymega",
                "chimecho-mega": "chimechomega",

                "absol-mega-z": "absolmegaz",
                "staraptor-mega": "staraptormega",
                "garchomp-mega-z": "garchompmegaz",
                "lucario-mega-z": "lucariomegaz",

                "froslass-mega": "froslassmega",
                "heatran-mega": "heatranmega",
                "darkrai-mega": "darkraimega",
                "emboar-mega": "emboar-mega",
                "excadrill-mega": "excadrillmega",
                "scolipede-mega": "scolipedemega",
                "scrafty-mega": "scraftymega",
                "eelektross-mega": "eelektrossmega",
                "chandelure-mega": "chandeluremega",
                "golurk-mega": "golurkmega",
                "chesnaught-mega": "chesnaughtmega",
                "delphox-mega": "delphoxmega",
                "greninja-mega": "greninjamega",
                "pyroar-mega": "pyroarmega",
                "floette-mega": "floettemega",
                "meowstic-m-mega": "meowsticmmega",
                "malamar-mega": "malamarmega",
                "barbaracle-mega": "barbaraclemega",
                "dragalge-mega": "dragalgemega",
                "hawlucha-mega": "hawluchamega",
                "zygarde-mega": "zygardemega",
                "crabominable-mega": "crabominablemega",
                "golisopod-mega": "golisopodmega",
                "drampa-mega": "drampamega",

                "magearna-mega": "magearnamega",
                "magearna-original-mega": "magearnaoriginalmega",

                "zeraora-mega": "zeraoramega",
                "falinks-mega": "falinksmega",
                "scovillain-mega": "scovillain-mega",
                "glimmora-mega": "glimmora-mega",

                "tatsugiri-curly-mega": "tatsugiricurlymega",
                "tatsugiri-droopy-mega": "tatsugiridroopymega",
                "tatsugiri-stretchy-mega": "tatsugiristretchymega",

                "baxcalibur-mega": "baxcalibur-mega"

            };


            if (
                megaAliases[species]
            ) {

                add(
                    megaAliases[species]
                );

            }


            if (
                species === "greninja-bond"
            ) {

                add("greninja-ash");

            }


            if (
                species.endsWith("-dusk-mane")
            ) {

                add(
                    species.replace(
                        "-dusk-mane",
                        "-duskmane"
                    )
                );

            }


            if (
                species.endsWith("-dawn-wings")
            ) {

                add(
                    species.replace(
                        "-dawn-wings",
                        "-dawnwings"
                    )
                );

            }


            if (
                species.endsWith("-rapid-strike")
            ) {

                add(
                    species.replace(
                        "-rapid-strike",
                        "-rapidstrike"
                    )
                );

            }


            if (
                species.endsWith("-single-strike")
            ) {

                add(
                    species.replace(
                        "-single-strike",
                        "-singlestrike"
                    )
                );

            }


            if (
                species.endsWith("-ice-rider")
            ) {

                add(
                    species.replace(
                        "-ice-rider",
                        "-icerider"
                    )
                );

            }


            if (
                species.endsWith("-shadow-rider")
            ) {

                add(
                    species.replace(
                        "-shadow-rider",
                        "-shadowrider"
                    )
                );

            }


            if (
                species.endsWith("-mega-x")
            ) {

                add(
                    species.replace(
                        "-mega-x",
                        "-megax"
                    )
                );

            }


            if (
                species.endsWith("-mega-y")
            ) {

                add(
                    species.replace(
                        "-mega-y",
                        "-megay"
                    )
                );

            }


            add(
                species.replace(
                    /-mega-([a-z0-9-]+)$/,
                    "-mega$1"
                )
            );


            if (
                species.endsWith("-g-max")
            ) {

                add(
                    species.replace(
                        "-g-max",
                        "-gmax"
                    )
                );

            }


            if (
                species.endsWith("-gigantamax")
            ) {

                add(
                    species.replace(
                        "-gigantamax",
                        "-gmax"
                    )
                );

            }


            const aliases = {

                "nidoran-f": "nidoranf",
                "nidoran-m": "nidoranm",

                "wo-chien": "wochien",
                "chien-pao": "chienpao",
                "ting-lu": "tinglu",
                "chi-yu": "chiyu",

                "mr-mime": "mrmime",
                "mime-jr": "mimejr",

                "mr.mime": "mr-mime",
                "mr-rime": "mr-rime",

                "type-null": "type-null",

                "jangmo-o": "jangmo-o",
                "hakamo-o": "hakamo-o",
                "kommo-o": "kommo-o"

            };


            if (
                aliases[species]
            ) {

                add(
                    aliases[species]
                );

            }


            if (
                String(
                    pokemon?.gender || ""
                ).toUpperCase() === "F"
            ) {

                add(
                    `${species}-f`
                );

                add(
                    `${species.replace(
                /-/g,
                ""
            )}-f`
                );

            }


            add(
                species.replace(
                    /-/g,
                    ""
                )
            );


            return candidates;
        }


        /*
         * FORCE CUSTOM MEGA SPRITES
         */

        const forcedMegaSprites = {
            "raichumegax": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Raichu-X.png",

            "raichumegay": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Raichu-Y.png",

            "clefablemega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Clefable.png",

            "victreebelmega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Victreebel.png",

            "starmiemega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Starmie.png",

            "dragonitemega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Dragonite.png",

            "meganiummega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Meganium.png",

            "feraligatrmega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Feraligatr.png",

            "skarmorymega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Skarmory.png",

            "chimechomega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Chimecho.png",

            "absolmegaz": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Absol-Z.png",

            "staraptormega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Staraptor.png",

            "garchompmegaz": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Garchomp-Z.png",

            "lucariomegaz": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Lucario-Z.png",

            "froslassmega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Froslass.png",

            "heatranmega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Heatran.png",

            "darkraimega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Darkrai.png",

            "emboar-mega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Emboar.png",

            "excadrillmega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Excadrill.png",

            "scolipedemega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Scolipede.png",

            "scraftymega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Scrafty.png",

            "eelektrossmega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Eelektross.png",

            "chandeluremega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Chandelure.png",

            "golurkmega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Golurk.png",

            "chesnaughtmega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Chesnaught.png",

            "delphoxmega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Delphox.png",

            "greninjamega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Greninja.png",

            "pyroarmega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Pyroar.png",

            "floettemega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Floette.png",

            "meowsticmmega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Meowstic.png",

            "malamarmega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Malamar.png",

            "barbaraclemega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Barbaracle.png",

            "dragalgemega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Dragalge.png",

            "hawluchamega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Hawlucha.png",

            "zygardemega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Zygarde.png",

            "crabominablemega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Crabominable.png",

            "golisopodmega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Golisopod.png",

            "drampamega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Drampa.png",

            "magearnamega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Magearna.png",

            "magearnaoriginalmega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Magearna.png",

            "zeraoramega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Zeraora.png",

            "falinksmega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Falinks.png",

            "scovillain-mega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Scovillain.png",

            "glimmora-mega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Glimmora.png",

            "tatsugiricurlymega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Tatsugiri-Curly-Form.png",

            "tatsugiridroopymega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Tatsugiri-Droopy-Form.png",

            "tatsugiristretchymega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Tatsugiri-Stretchy-Form.png",

            "baxcalibur-mega": "https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Baxcalibur.png"
        };

        // The forced Mega sprite map must be initialized before this runs.
        setupPokePasteSprites();

        new MutationObserver(() => {

            setupPokePasteSprites();

        }).observe(
            document.body, {
                childList: true,
                subtree: true
            }
        );

        function replaceMegaSprites() {

            document.querySelectorAll("*").forEach(el => {

                const src =
                    el.getAttribute("src") || "";

                const style =
                    el.getAttribute("style") || "";

                const text =
                    (src + " " + style).toLowerCase();


                /*
                 * Detect Gen 5 front/back sprites
                 */
                const isFront =
                    text.includes("gen5/");

                const isBack =
                    text.includes("gen5-back/");


                if (!isFront && !isBack) {
                    return;
                }


                /*
                 * Check every Mega in your
                 * forcedMegaSprites list
                 */
                for (
                    const [key, url] of Object.entries(forcedMegaSprites)
                ) {

                    const cleanKey =
                        key
                        .toLowerCase()
                        .replace(
                            /[^a-z0-9]/g,
                            ""
                        );


                    const cleanText =
                        text.replace(
                            /[^a-z0-9]/g,
                            ""
                        );


                    if (
                        !cleanText.includes(
                            cleanKey
                        )
                    ) {
                        continue;
                    }


                    /*
                     * Replace IMG sprite
                     */
                    if (
                        el.tagName === "IMG"
                    ) {

                        if (
                            el.src !== url
                        ) {
                            el.src = url;
                        }

                    }


                    /*
                     * Replace background sprite
                     */
                    else if (
                        el.getAttribute("style")
                    ) {

                        el.style.setProperty(
                            "background-image",
                            `url("${url}")`,
                            "important"
                        );

                    }


                    /*
                     * All custom Mega sprites
                     */
                    el.style.setProperty(
                        "image-rendering",
                        "crisp-edges",
                        "important"
                    );

                    el.style.setProperty(
                        "display",
                        "block",
                        "important"
                    );


                    /*
                     * BACK SPRITES
                     *
                     * Flip horizontally.
                     */
                    if (isBack) {

                        el.style.setProperty(
                            "transform",
                            "scaleX(-1)",
                            "important"
                        );

                    }


                    /*
                     * SPRITES INSIDE INNERBATTLE
                     *
                     * Scale them to 1.3x.
                     */
                    if (
                        el.closest(
                            ".innerbattle"
                        )
                    ) {

                        if (isBack) {

                            /*
                             * Back sprite:
                             * flip + scale
                             */
                            el.style.setProperty(
                                "transform",
                                "scaleX(-1) scale(1.3)",
                                "important"
                            );

                        } else {

                            /*
                             * Front sprite:
                             * scale only
                             */
                            el.style.setProperty(
                                "transform",
                                "scale(1.3)",
                                "important"
                            );

                        }

                    }


                    /*
                     * Found the correct Mega.
                     */
                    break;
                }

            });

        }


        /*
         * Run immediately
         */
        replaceMegaSprites();


        /*
         * Watch the entire website
         */
        new MutationObserver(
            replaceMegaSprites
        ).observe(
            document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: [
                    "src",
                    "style"
                ]
            }
        );
        /*
         * FALLBACK FOR ANY BROKEN IMAGE
         */

        const brokenImageFallback =
            "https://archives.bulbagarden.net/media/upload/8/81/LitGhost.png";


        function setupImageFallback(img) {

            if (!img) {
                return;
            }

            // PokéPaste has its own sprite loader with multiple candidates.
            // Never let the generic fallback replace those images with LitGhost.
            if (img.classList && img.classList.contains("ps-pp-sprite")) {
                return;
            }

            if (img.dataset.spriteFallbackSetup) {
                return;
            }


            /*
             * Check whether this image belongs
             * to one of the custom Mega Pokémon.
             */

            function isProtectedMega(img) {

                const src =
                    String(
                        img.currentSrc ||
                        img.src ||
                        ""
                    ).toLowerCase();


                /*
                 * Check original Showdown filenames.
                 *
                 * Example:
                 * raichu-megax.gif
                 * -> raichumegax
                 */

                for (
                    const name of Object.keys(
                        forcedMegaSprites
                    )
                ) {

                    const cleanName =
                        name
                        .toLowerCase()
                        .replace(
                            /[^a-z0-9]/g,
                            ""
                        );


                    const cleanSrc =
                        src.replace(
                            /[^a-z0-9]/g,
                            ""
                        );


                    if (
                        cleanSrc.includes(
                            cleanName
                        )
                    ) {
                        return true;
                    }

                }


                /*
                 * Check the custom image URLs.
                 *
                 * Example:
                 * Mega-Raichu-X.png
                 */

                for (
                    const url of Object.values(
                        forcedMegaSprites
                    )
                ) {

                    const cleanUrl =
                        String(url)
                        .toLowerCase()
                        .replace(
                            /[^a-z0-9]/g,
                            ""
                        );


                    const cleanSrc =
                        src.replace(
                            /[^a-z0-9]/g,
                            ""
                        );


                    if (
                        cleanSrc.includes(
                            cleanUrl
                        )
                    ) {
                        return true;
                    }

                }


                return false;
            }


            /*
             * Mark image as handled.
             */

            img.dataset.spriteFallbackSetup =
                "true";


            img.addEventListener(
                "error",
                function() {

                    /*
                     * IMPORTANT:
                     *
                     * Your custom Mega Pokémon
                     * are completely ignored.
                     *
                     * No display:none.
                     * No LitGhost.
                     * No replacement.
                     */

                    if (
                        isProtectedMega(img)
                    ) {
                        return;
                    }


                    /*
                     * Every other broken image
                     * becomes LitGhost.
                     */

                    if (
                        img.src !==
                        brokenImageFallback
                    ) {

                        img.src =
                            brokenImageFallback;

                    }

                }
            );

        }


        /*
         * Existing images
         */

        document
            .querySelectorAll("img")
            .forEach(
                setupImageFallback
            );


        /*
         * Future images created by Showdown
         */

        const spriteObserver =
            new MutationObserver(
                mutations => {

                    for (
                        const mutation of mutations
                    ) {

                        for (
                            const node of mutation.addedNodes
                        ) {

                            if (
                                node.nodeType !== 1
                            ) {
                                continue;
                            }


                            if (
                                node.tagName === "IMG"
                            ) {

                                setupImageFallback(
                                    node
                                );

                            }


                            if (
                                node.querySelectorAll
                            ) {

                                node
                                    .querySelectorAll("img")
                                    .forEach(
                                        setupImageFallback
                                    );

                            }

                        }

                    }

                }
            );


        spriteObserver.observe(
            document.body, {
                childList: true,
                subtree: true
            }
        );

        // ============================================================
        // GAME DATA / COLORS
        // ============================================================

        function getID(value) {
            if (typeof toID === "function") {
                return toID(value);
            }

            return String(value || "")
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "");
        }


        function getShowdownUsernameColor(name) {

            try {
                if (
                    typeof BattleLog !== "undefined" &&
                    typeof BattleLog.usernameColor === "function"
                ) {
                    return BattleLog.usernameColor(
                        getID(name)
                    );
                }
            } catch {}

            return null;
        }


        function getDexSpecies(species) {

            try {
                if (
                    typeof Dex !== "undefined" &&
                    Dex.species &&
                    typeof Dex.species.get === "function"
                ) {
                    const result = Dex.species.get(species);

                    if (
                        result &&
                        result.exists !== false
                    ) {
                        return result;
                    }
                }
            } catch {}

            return null;
        }


        function getPokemonTypes(pokemon) {

            const dexSpecies =
                getDexSpecies(pokemon.species);

            if (
                dexSpecies &&
                Array.isArray(dexSpecies.types) &&
                dexSpecies.types.length
            ) {
                return dexSpecies.types;
            }

            const id = getID(pokemon.species);
            const entry = pokedexData?.[id];

            if (
                entry &&
                Array.isArray(entry.types) &&
                entry.types.length
            ) {
                return entry.types;
            }

            return [];
        }


        function getPokemonTypeColor(pokemon) {

            const types =
                getPokemonTypes(pokemon);

            if (!types.length) {
                return null;
            }

            return TYPE_COLORS[
                String(types[0]).toLowerCase()
            ] || null;
        }


        function getMoveType(moveName) {

            try {
                if (
                    typeof Dex !== "undefined" &&
                    Dex.moves &&
                    typeof Dex.moves.get === "function"
                ) {
                    const move = Dex.moves.get(moveName);

                    if (move && move.type) {
                        return String(move.type).toLowerCase();
                    }
                }
            } catch {}

            const data =
                moveData?.[getID(moveName)];

            return data?.type ?
                String(data.type).toLowerCase() :
                null;
        }


        function colorMoveElement(element, moveName) {

            const type = getMoveType(moveName);

            if (!type) return;

            if (type === "stellar") {

                element.style.setProperty(
                    "background",
                    `linear-gradient(90deg,
                    #ff0000,#ff8800,#ffee00,
                    #22cc44,#00bfff,#5555ff,
                    #cc44ff,#ff2299,#ff0000)`,
                    "important"
                );

                element.style.setProperty(
                    "background-size",
                    "300% 100%",
                    "important"
                );

                element.style.setProperty(
                    "-webkit-background-clip",
                    "text",
                    "important"
                );

                element.style.setProperty(
                    "background-clip",
                    "text",
                    "important"
                );

                element.style.setProperty(
                    "-webkit-text-fill-color",
                    "transparent",
                    "important"
                );

                element.style.setProperty(
                    "font-weight",
                    "700",
                    "important"
                );

                element.style.setProperty(
                    "animation",
                    "psPPStellarRainbow 4s linear infinite",
                    "important"
                );

                return;
            }

            const color = TYPE_COLORS[type];

            if (!color) return;

            element.style.setProperty(
                "color",
                color,
                "important"
            );

            element.style.setProperty(
                "font-weight",
                "700",
                "important"
            );
        }


        function normalizeItemIconName(item) {

            const name =
                String(item || "")
                .trim()
                .toLowerCase()
                .replace(/[’']/g, "")
                .replace(/&/g, "and")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");

            return name;
        }


        function createItemIcon(item) {

            if (!item) return null;

            const icon =
                document.createElement("span");

            icon.className =
                "ps-pp-item-icon";

            icon.title =
                item;

            icon.setAttribute(
                "aria-label",
                item
            );

            let nativeStyleApplied =
                false;

            /*
             * Use Pokémon Showdown's own item-icon renderer.
             * This is important because the sheet is not safely
             * addressable by guessing a row/column: Showdown's
             * sprite data assigns every item its exact sprite
             * number/position.
             */
            try {

                if (
                    typeof Dex !== "undefined" &&
                    Dex &&
                    typeof Dex.getItemIcon ===
                    "function"
                ) {

                    const style =
                        Dex.getItemIcon(item);

                    if (
                        typeof style ===
                        "string"
                    ) {

                        icon.style.cssText =
                            style;

                        nativeStyleApplied =
                            true;

                    } else if (
                        style &&
                        typeof style ===
                        "object"
                    ) {

                        Object.assign(
                            icon.style,
                            style
                        );

                        nativeStyleApplied =
                            true;
                    }
                }

            } catch {}


            /*
             * Fallback for an older Showdown client where
             * Dex.getItemIcon isn't exposed.
             */
            if (!nativeStyleApplied) {

                const id =
                    getID(item);

                const filename =
                    String(item)
                    .trim()
                    .toLowerCase()
                    .replace(/[’']/g, "")
                    .replace(/&/g, "and")
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, "");

                icon.style.background =
                    `transparent url("${ITEM_ICON_BASE}${filename}.png") no-repeat center`;

                icon.style.backgroundSize =
                    "contain";

                icon.dataset.itemId =
                    id;
            }

            return icon;
        }


        function isPokemonShiny(
            pokemon
        ) {

            if (!pokemon)
                return false;


            /*
             * The parser stores normal PokéPaste fields as:
             *
             *   Shiny: Yes
             *
             * Keep this generalized so it also works if another
             * parser version stores shiny directly on the object.
             */
            if (
                pokemon.shiny === true
            ) {
                return true;
            }


            if (
                String(
                    pokemon.shiny || ""
                )
                .trim()
                .toLowerCase() ===
                "yes"
            ) {
                return true;
            }


            const fields =
                Array.isArray(
                    pokemon.fields
                ) ?
                pokemon.fields : [];


            return fields.some(
                field =>
                field &&
                String(
                    field.key || ""
                )
                .trim()
                .toLowerCase() ===
                "shiny" &&
                String(
                    field.value || ""
                )
                .trim()
                .toLowerCase() ===
                "yes"
            );
        }


        function createSprite(pokemon) {

            const link =
                document.createElement("a");

            link.className =
                "ps-pp-sprite-link";


            /*
             * Keep the existing Smogon Pokédex behavior.
             */
            const dexId =
                String(
                    pokemon.species || ""
                )
                .toLowerCase()
                .normalize("NFD")
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                )
                .replace(
                    /[^a-z0-9]+/g,
                    ""
                );


            link.href =
                `https://www.smogon.com/dex/sv/pokemon/${dexId}/`;

            link.target =
                "_blank";

            link.rel =
                "noopener noreferrer";


            const sprite =
                document.createElement("img");

            sprite.className =
                "ps-pp-sprite";

            sprite.alt =
                pokemon.species || "";


            /*
             * Shiny: Yes -> use Showdown's dedicated gen5-shiny
             * directory. All existing form/female/mega/gmax candidate
             * logic is preserved; only the base directory changes.
             */
            const spriteBase =
                isPokemonShiny(
                    pokemon
                ) ?
                SHINY_SPRITE_BASE :
                SPRITE_BASE;


            /*
             * ========================================================
             * URSHIFU RAPID STRIKE ONLY
             *
             * PokéPaste names this:
             *   Urshifu-Rapid-Strike
             *
             * Showdown's Gen 5 sprite is:
             *   urshifu-rapidstrike.png
             *
             * IMPORTANT:
             * We return the exact URL directly. We do not call the
             * normal candidate/female sprite resolver for this form.
             * Therefore "-f.png" can never be requested for it.
             * ========================================================
             */
            const speciesKey =
                String(
                    pokemon.species || ""
                )
                .toLowerCase()
                .replace(
                    /[^a-z0-9]/g,
                    ""
                );


            const rapidStrike =
                speciesKey ===
                "urshifurapidstrike" ||
                speciesKey ===
                "urshifurapidstrikegmax";


            if (
                rapidStrike
            ) {

                const filename =
                    speciesKey ===
                    "urshifurapidstrikegmax" ?
                    "urshifu-rapidstrikegmax" :
                    "urshifu-rapidstrike";


                sprite.src =
                    spriteBase +
                    filename +
                    ".png";


                /*
                 * No fallback here.
                 * In particular, NEVER add "-f".
                 */
                sprite.onerror =
                    () => {

                        sprite.style.display =
                            "none";
                    };


            } else {

                /*
                 * Existing generalized sprite logic for every
                 * Pokemon other than Urshifu Rapid Strike.
                 */
                const candidates =
                    getSpriteCandidates(
                        pokemon
                    );


                let index =
                    0;


                const loadNext =
                    () => {

                        if (
                            index >=
                            candidates.length
                        ) {

                            sprite.style.display =
                                "none";

                            return;
                        }


                        sprite.src =
                            spriteBase +
                            candidates[index++] +
                            ".png";
                    };


                sprite.onerror =
                    loadNext;


                loadNext();
            }


            link.appendChild(
                sprite
            );


            return link;
        }


        async function loadGameData() {

            if (gameDataPromise) {
                return gameDataPromise;
            }

            gameDataPromise =
                Promise.all([
                    pokedexData ?
                    Promise.resolve(pokedexData) :
                    fetch(DEX_URL, {
                        cache: "force-cache"
                    })
                    .then(response =>
                        response.ok ?
                        response.json() :
                        null
                    )
                    .catch(() => null),
                    moveData ?
                    Promise.resolve(moveData) :
                    fetch(MOVE_URL, {
                        cache: "force-cache"
                    })
                    .then(response =>
                        response.ok ?
                        response.json() :
                        null
                    )
                    .catch(() => null)
                ])
                .then(([dex, moves]) => {

                    if (dex) pokedexData = dex;
                    if (moves) moveData = moves;

                    if (lastPasteData) {
                        renderPaste(lastPasteData);
                    }
                })
                .catch(() => {});

            return gameDataPromise;
        }


        // ============================================================
        // RENDER PASTE
        // ============================================================

        // ============================================================

        function renderPaste(data) {

            const content =
                document.querySelector(
                    `#${POKEPASTE_ROOM_ID} .ps-pp-content`
                );

            if (!content) return;

            const team =
                parsePaste(data.paste);

            if (!team.length) {
                showStatus(
                    "No Pokémon entries were detected.",
                    true
                );
                return;
            }

            content.innerHTML = "";

            /*
             * Team title is shown in the toolbar.
             * Author is intentionally rendered as a footer after
             * all Pokémon cards.
             */

            const grid =
                document.createElement("div");

            grid.className =
                "ps-pp-team";

            team.forEach(pokemon => {
                grid.appendChild(
                    createPokemonCard(pokemon)
                );
            });

            content.appendChild(grid);


            /*
             * Author footer appears after the entire team.
             * "by" stays white while the username keeps its
             * Showdown username color.
             */
            if (data.author) {

                const footer =
                    document.createElement(
                        "div"
                    );

                footer.className =
                    "ps-pp-footer";


                const author =
                    document.createElement(
                        "div"
                    );

                author.className =
                    "ps-pp-author";


                const by =
                    document.createElement(
                        "span"
                    );

                by.className =
                    "ps-pp-author-by";

                by.textContent =
                    "by ";


                const authorName =
                    document.createElement(
                        "span"
                    );

                authorName.className =
                    "ps-pp-author-name";

                authorName.textContent =
                    data.author;


                const color =
                    getShowdownUsernameColor(
                        data.author
                    );

                if (color) {

                    authorName.style.setProperty(
                        "color",
                        color,
                        "important"
                    );
                }


                author.appendChild(
                    by
                );

                author.appendChild(
                    authorName
                );

                footer.appendChild(
                    author
                );

                content.appendChild(
                    footer
                );
            }


            /*
             * Keep the toolbar title synchronized with the
             * currently rendered PokéPaste.
             */
            syncActiveTabUI();


            /*
             * Game data is loaded only after a paste exists.
             * This keeps the viewer itself fast to open.
             */
            if (!pokedexData || !moveData) {
                loadGameData();
            }
        }


        function parseEVSegments(value) {

            return String(value || "")
                .split("/")
                .map(part => part.trim())
                .filter(Boolean)
                .map(part => {

                    const match =
                        part.match(
                            /^(\d+)\s+(HP|Atk|Def|SpA|SpD|Spe)$/i
                        );

                    if (!match) {
                        return {
                            text: part,
                            stat: null
                        };
                    }

                    return {
                        text: part,
                        stat: match[2].toLowerCase()
                    };
                });
        }


        function appendColoredEVs(row, value) {

            const segments =
                parseEVSegments(value);

            segments.forEach((segment, index) => {

                if (index > 0) {
                    row.appendChild(
                        document.createTextNode(" / ")
                    );
                }

                const span =
                    document.createElement("span");

                if (segment.stat) {
                    span.className =
                        `ps-pp-ev-stat ps-pp-ev-${segment.stat}`;
                }

                span.textContent =
                    segment.text;

                row.appendChild(span);
            });
        }


        // ============================================================
        // BUILD INDIVIDUAL POKEMON IMPORT
        // ============================================================

        function buildPokemonImport(pokemon) {

            const lines = [];

            let firstLine =
                pokemon.nickname &&
                pokemon.nickname !== pokemon.species ?
                `${pokemon.nickname} (${pokemon.species})` :
                pokemon.species;

            if (pokemon.gender === "F" || pokemon.gender === "M") {
                firstLine += ` (${pokemon.gender})`;
            }

            if (pokemon.item) {
                firstLine += ` @ ${pokemon.item}`;
            }

            lines.push(firstLine);

            pokemon.fields.forEach(field => {
                if (!field || !field.value) return;

                if (field.key) {
                    lines.push(`${field.key}: ${field.value}`);
                } else {
                    lines.push(field.value);
                }
            });

            pokemon.moves.forEach(move => {
                lines.push(`- ${move}`);
            });

            return lines.join("\n");
        }


        // ============================================================
        // COPY INDIVIDUAL POKEMON
        // ============================================================

        async function copyPokemonImport(pokemon, card) {

            const text =
                buildPokemonImport(pokemon).trim();

            if (!text) return false;

            let copied = false;

            // Tampermonkey clipboard API
            if (typeof GM_setClipboard === "function") {
                try {
                    GM_setClipboard(text, "text");
                    copied = true;
                } catch (error) {}
            }

            // Browser clipboard fallback
            if (!copied && navigator.clipboard && navigator.clipboard.writeText) {
                try {
                    await navigator.clipboard.writeText(text);
                    copied = true;
                } catch (error) {}
            }

            // Old-browser fallback
            if (!copied) {
                try {
                    const textarea = document.createElement("textarea");
                    textarea.value = text;
                    textarea.setAttribute("readonly", "");
                    textarea.style.position = "fixed";
                    textarea.style.left = "-9999px";
                    textarea.style.top = "0";
                    textarea.style.opacity = "0";
                    document.body.appendChild(textarea);
                    textarea.focus();
                    textarea.select();
                    textarea.setSelectionRange(0, text.length);
                    copied = document.execCommand("copy");
                    textarea.remove();
                } catch (error) {}
            }

            if (card && copied) {
                card.classList.add("ps-pp-copied");

                const oldTitle =
                    card.getAttribute("data-copy-title") ||
                    "Click to copy this Pokémon's import";

                card.setAttribute("title", "Copied!");

                clearTimeout(card._copyTimer);
                card._copyTimer = setTimeout(() => {
                    card.classList.remove("ps-pp-copied");
                    card.setAttribute("title", oldTitle);
                }, 700);
            }

            return copied;
        }


        function createPokemonCard(pokemon) {

            const card =
                document.createElement("div");

            card.className =
                "ps-pp-pokemon";

            card.setAttribute(
                "title",
                "Click to copy this Pokémon's import"
            );

            card.setAttribute(
                "data-copy-title",
                "Click to copy this Pokémon's import"
            );

            card.addEventListener(
                "click",
                function(event) {

                    // Let the sprite's Pokédex link work normally.
                    if (event.target && event.target.closest && event.target.closest("a")) {
                        return;
                    }

                    event.preventDefault();
                    event.stopPropagation();

                    copyPokemonImport(
                        pokemon,
                        card
                    );
                },
                false
            );

            card.appendChild(
                createSprite(pokemon)
            );

            let cardItem =
                pokemon.item || "";

            if (!cardItem) {

                const itemField =
                    pokemon.fields.find(
                        field =>
                        field &&
                        field.key &&
                        String(field.key)
                        .toLowerCase() ===
                        "item"
                    );

                if (itemField) {
                    cardItem =
                        itemField.value || "";
                }
            }


            const itemIcon =
                createItemIcon(
                    cardItem
                );

            if (itemIcon) {
                card.appendChild(itemIcon);
            }

            const name =
                document.createElement("div");

            name.className =
                "ps-pp-name";

            let displayName =
                pokemon.species;

            if (
                pokemon.nickname &&
                pokemon.nickname !== pokemon.species
            ) {
                displayName =
                    `${pokemon.nickname} (${pokemon.species})`;
            }

            const pokemonName =
                document.createElement("span");

            pokemonName.className =
                "ps-pp-pokemon-name";

            pokemonName.textContent =
                displayName;

            const nameColor =
                getPokemonTypeColor(pokemon);

            if (nameColor) {
                pokemonName.style.setProperty(
                    "color",
                    nameColor,
                    "important"
                );
            }

            name.appendChild(
                pokemonName
            );

            /*
             * Show the held item directly after the Pokémon name.
             * Fall back to an Item field for parser variants.
             */
            let visibleItem =
                pokemon.item || "";

            if (!visibleItem) {

                const itemField =
                    pokemon.fields.find(
                        field =>
                        field &&
                        field.key &&
                        String(field.key)
                        .toLowerCase() ===
                        "item"
                    );

                if (itemField) {
                    visibleItem =
                        itemField.value || "";
                }
            }


            if (visibleItem) {

                const itemName =
                    document.createElement("span");

                itemName.className =
                    "ps-pp-item-name";

                itemName.textContent =
                    ` @ ${visibleItem}`;

                name.appendChild(
                    itemName
                );
            }

            card.appendChild(name);

            pokemon.fields.forEach(field => {

                if (!field.value) return;

                const row =
                    document.createElement("div");

                row.className =
                    "ps-pp-field";

                if (field.key) {

                    const label =
                        document.createElement("span");

                    label.className =
                        "ps-pp-label";

                    label.textContent =
                        `${field.key}: `;

                    row.appendChild(label);
                }

                if (
                    field.key.toLowerCase() === "evs"
                ) {
                    appendColoredEVs(
                        row,
                        field.value
                    );
                } else {
                    row.appendChild(
                        document.createTextNode(
                            field.value
                        )
                    );
                }

                card.appendChild(row);
            });

            if (pokemon.moves.length) {

                const moves =
                    document.createElement("div");

                moves.className =
                    "ps-pp-moves";

                pokemon.moves.forEach(move => {

                    const row =
                        document.createElement("div");

                    row.className =
                        "ps-pp-move";

                    row.textContent =
                        `- ${move}`;

                    colorMoveElement(
                        row,
                        move
                    );

                    moves.appendChild(row);
                });

                card.appendChild(moves);
            }

            return card;
        }


        // ============================================================
        // COPY
        // ============================================================

        async function sharePaste() {

            const tab =
                getActivePasteTab();

            const url =
                tab && tab.url ?
                normalizeURL(tab.url) :
                "";

            if (!url) return;

            const button =
                document.querySelector(
                    `#${POKEPASTE_ROOM_ID} .ps-pp-share`
                );

            let copied = false;

            try {
                if (
                    navigator.clipboard &&
                    navigator.clipboard.writeText
                ) {
                    await navigator.clipboard.writeText(url);
                    copied = true;
                }
            } catch {}

            if (!copied) {

                const textarea =
                    document.createElement("textarea");

                textarea.value = url;
                textarea.style.position = "fixed";
                textarea.style.left = "-9999px";

                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();

                try {
                    copied =
                        document.execCommand("copy");
                } catch {}

                textarea.remove();
            }

            if (button) {

                button.textContent =
                    copied ? "Copied!" : "Failed";

                if (copied)
                    button.classList.add("copied");

                setTimeout(() => {

                    button.textContent = "Share";
                    button.classList.remove("copied");

                }, 1200);
            }
        }




        async function copyPaste() {

            if (
                !lastPasteData ||
                typeof lastPasteData.paste !==
                "string"
            ) {

                return;
            }


            const button =
                document.querySelector(
                    `#${POKEPASTE_ROOM_ID} .ps-pp-copy`
                );


            const text =
                lastPasteData.paste.trim();


            try {

                await navigator.clipboard.writeText(
                    text
                );


                if (button) {

                    button.textContent =
                        "Copied!";

                    button.classList.add(
                        "copied"
                    );
                }

            } catch {

                const textarea =
                    document.createElement(
                        "textarea"
                    );


                textarea.value =
                    text;


                textarea.style.position =
                    "fixed";


                textarea.style.left =
                    "-9999px";


                document.body.appendChild(
                    textarea
                );


                textarea.focus();

                textarea.select();


                let success =
                    false;


                try {

                    success =
                        document.execCommand(
                            "copy"
                        );

                } catch {}


                textarea.remove();


                if (button) {

                    button.textContent =
                        success ?
                        "Copied!" :
                        "Failed";


                    if (success) {

                        button.classList.add(
                            "copied"
                        );
                    }
                }
            }


            setTimeout(
                () => {

                    if (button) {

                        button.textContent =
                            "Copy";

                        button.classList.remove(
                            "copied"
                        );
                    }

                },
                1200
            );
        }


    })();



    // ============================================================

})();
const TP_STYLE_ID = "my-battle-tooltip-style";
let TP_lastBattleType = null;

function TP_getBattleGameType() {

    const TP_app =
        typeof unsafeWindow !== "undefined" ?
        unsafeWindow.app :
        window.app;

    const TP_currentRoom =
        TP_app?.curRoom;

    const TP_battle =
        TP_currentRoom?.battle ||
        TP_currentRoom?.child?.battle;

    if (!TP_battle) {
        return null;
    }

    return TP_battle.gameType || null;
}


function TP_updateTooltipStyle() {

    const TP_gameType =
        TP_getBattleGameType();

    if (!TP_gameType) {
        return;
    }

    if (
        TP_gameType ===
        TP_lastBattleType
    ) {
        return;
    }

    TP_lastBattleType =
        TP_gameType;

    document
        .getElementById(TP_STYLE_ID)
        ?.remove();

    const TP_style =
        document.createElement("style");

    TP_style.id =
        TP_STYLE_ID;


    if (TP_gameType === "doubles") {

        TP_style.textContent = `

            .tooltips > div[data-id="p1a"] {
                left: 150px !important;
            }

            .tooltips > div[data-id="p1b"] {
                top: 210px !important;
                left: 350px !important;
                width: 120px !important;
            }

            .tooltips > div[data-id="p1c"] {
                display: none !important;
            }

            .tooltips > div[data-id="p2a"] {
                top: 80px !important;
                height: 120px !important;
                left: 490px !important;
                width: 120px !important;
            }

            .tooltips > div[data-id="p2b"] {
                top: 55px !important;
                height: 120px !important;
                left: 300px !important;
                width: 120px !important;
            }

            .tooltips > div[data-id="p2c"] {
                display: none !important;
            }

        `;


    } else if (TP_gameType === "singles") {

        TP_style.textContent = `

            .tooltips > div[data-id="p1a"] {
                left: 200px !important;
            }

            .tooltips > div[data-id="p1b"],
            .tooltips > div[data-id="p1c"] {
                display: none !important;
            }

            .tooltips > div[data-id="p2a"] {
                top: 75px !important;
                left: 440px !important;
                width: 120px !important;
                height: 120px !important;
            }

            .tooltips > div[data-id="p2b"],
            .tooltips > div[data-id="p2c"] {
                display: none !important;
            }

        `;


    } else if (TP_gameType === "triples") {

        TP_style.textContent = `

            .tooltips > div[data-id="p1a"] {
                top: 205px !important;
                left: 140px !important;
                width: 120px !important;
                height: 120px !important;
            }

            .tooltips > div[data-id="p1b"] {
                top: 225px !important;
                left: 330px !important;
                width: 120px !important;
                height: 120px !important;
            }

            .tooltips > div[data-id="p1c"] {
                top: 245px !important;
                left: 520px !important;
                width: 120px !important;
                height: 120px !important;
            }

            .tooltips > div[data-id="p2a"] {
                top: 95px !important;
                left: 490px !important;
                width: 120px !important;
                height: 120px !important;
            }

            .tooltips > div[data-id="p2b"] {
                top: 75px !important;
                left: 320px !important;
                width: 120px !important;
                height: 120px !important;
            }

            .tooltips > div[data-id="p2c"] {
                top: 55px !important;
                left: 140px !important;
                width: 120px !important;
                height: 120px !important;
            }

        `;


    } else if (TP_gameType === "freeforall") {

        TP_style.textContent = `

            .tooltips > div[data-id="p1a"] {
                top: 200px !important;
                left: 170px !important;
                width: 120px !important;
                height: 160px !important;
            }

            .tooltips > div[data-id="p1b"] {
                top: 220px !important;
                left: 360px !important;
                width: 150px !important;
                height: 160px !important;
            }

            .tooltips > div[data-id="p1c"] {
            display: none!important;
            }

            .tooltips > div[data-id="p2a"] {
                top: 90px !important;
                left: 470px !important;
                width: 100px !important;
                height: 100px !important;
            }

            .tooltips > div[data-id="p2b"] {
                top: 65px !important;
                left: 250px !important;
                width: 100px !important;
                height: 100px !important;
            }

            .tooltips > div[data-id="p2c"] {
                display: none !important;
            }

        `;


    } else if (TP_gameType === "multi") {

        TP_style.textContent = `

            .tooltips > div[data-id="p1a"] {
                top: 200px !important;
                left: 150px !important;
                width: 120px !important;
                height: 160px !important;
            }

            .tooltips > div[data-id="p1b"] {
                top: 220px !important;
                left: 400px !important;
                width: 150px !important;
                height: 160px !important;
            }

            .tooltips > div[data-id="p1c"] {
            display: none!important;
            }

            .tooltips > div[data-id="p2a"] {
                top: 90px !important;
                left: 500px !important;
                width: 100px !important;
                height: 100px !important;
            }

            .tooltips > div[data-id="p2b"] {
                top: 85px !important;
                left: 320px !important;
                width: 100px !important;
                height: 100px !important;
            }

            .tooltips > div[data-id="p2c"] {
                display: none !important;
            }

        `;
    }


    document.head.appendChild(TP_style);
}


setInterval(
    TP_updateTooltipStyle,
    1000
);

TP_updateTooltipStyle();
// ============================================================
// NEW FUNCTIONS
// Paste future functions here
// ============================================================


// ============================================================
// POKEPASTE
// ============================================================
GM_addStyle(`
    .brutalist-button {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        cursor: pointer;
        width: 180px;
        height: 60px;
        background-color: #000;
        color: #fff;
        font-family: Arial, sans-serif;
        font-weight: bold;
        border: 3px solid #fff;
        outline: 3px solid #000;
        box-shadow: 6px 6px 0 #828282;
        transition: all 0.1s ease-out;
        padding: 0 15px;
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
        right: -70px;
        top: 250px;
    }

    .brutalist-button::before {
        content: "";
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.8),
            transparent
        );
        z-index: 1;
        opacity: 0;
    }

    @keyframes slide {
        0% {
            left: -100%;
        }

        100% {
            left: 100%;
        }
    }

    .brutalist-button:hover::before {
        opacity: 1;
        animation: slide 2s infinite;
    }

    .brutalist-button:hover {
        transform: translate(-4px, -4px);
        box-shadow: 10px 10px 0 #000;
        background-color: #000;
        color: #fff;
    }

    .brutalist-button:active {
        transform: translate(4px, 4px);
        box-shadow: 0 0 0 #9f9f9f;
        background-color: #fff;
        color: #000;
        border-color: #000;
    }

    .ms-logo {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        margin-right: 10px;
        flex-shrink: 0;
        position: relative;
        z-index: 2;
        transition: transform 0.2s ease-out;
    }

    .pokeball-icon {
        width: 32px;
        height: 32px;
        display: block;
        object-fit: contain;
    }

    .brutalist-button:hover .ms-logo {
        transform: rotate(-10deg) scale(1.1);
    }

    .brutalist-button:active .ms-logo {
        transform: rotate(10deg) scale(0.9);
    }

    .button-text {
        display: flex;
        flex-direction: column;
        line-height: 1.2;
        transition: transform 0.2s ease-out;
        position: relative;
        z-index: 2;
        text-align: left;
    }

    .brutalist-button:hover .button-text {
        transform: skew(-5deg);
    }

    .brutalist-button:active .button-text {
        transform: skew(5deg);
    }

    .button-text span:first-child {
        font-size: 11px;
        text-transform: uppercase;
    }

    .button-text span:last-child {
        font-size: 16px;
        text-transform: uppercase;
    }
`);
(function PokepasteModule() {
    "use strict";

    const PASTE_KEY = "pokepaste-result-isolated-v4";
    const SHOWDOWN_KEY = "pokepaste-showdown-receiver-v1";
    const PASTE_LOCK = "__pokepaste_module_lock_v4";

    function getPasteUrl() {
        const id = location.pathname.replace(/^\/+|\/+$/g, "");

        if (
            !id ||
            id === "create" ||
            id === "about" ||
            id === "format" ||
            !/^[A-Za-z0-9_-]+$/.test(id)
        ) {
            return null;
        }

        return "https://pokepast.es/" + id;
    }

    function showOpenShowdownButton(url) {
        document.getElementById("pp-open-showdown")?.remove();
        document.getElementById("pp-open-showdown-style")?.remove();

        const style = document.createElement("style");

        style.id = "pp-open-showdown-style";

        style.textContent = `
        .brutalist-button {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            cursor: pointer;
            width: 180px;
            height: 60px;
            background-color: #000;
            color: #fff;
            font-family: Arial, sans-serif;
            font-weight: bold;
            border: 3px solid #fff;
            outline: 3px solid #000;
            box-shadow: 6px 6px 0 #828282;
            transition: all 0.1s ease-out;
            padding: 0 15px;
            box-sizing: border-box;
            position: fixed;
            overflow: hidden;
            right: 70px;
            top: 250px;
        }

        .brutalist-button::before {
            content: "";
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
                90deg,
                transparent,
                rgba(255, 255, 255, 0.8),
                transparent
            );
            z-index: 1;
            transition: none;
            opacity: 0;
        }

        @keyframes pp-slide {
            0% {
                left: -100%;
            }
            100% {
                left: 100%;
            }
        }

        .brutalist-button:hover::before {
            opacity: 1;
            animation: pp-slide 2s infinite;
        }

        .brutalist-button:hover {
            transform: translate(-4px, -4px);
            box-shadow: 10px 10px 0 #000;
            background-color: #000;
            color: #fff;
        }

        .brutalist-button:active {
            transform: translate(4px, 4px);
            box-shadow: 0 0 0 #9f9f9f;
            background-color: #fff;
            color: #000;
            border-color: #000;
        }

        .ms-logo {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            margin-right: 10px;
            flex-shrink: 0;
            position: relative;
            z-index: 2;
            transition: transform 0.2s ease-out;
        }

        .pokeball-icon {
            width: 32px;
            height: 32px;
            display: block;
            object-fit: contain;
        }

        .brutalist-button:hover .ms-logo {
            transform: rotate(-10deg) scale(1.1);
        }

        .brutalist-button:active .ms-logo {
            transform: rotate(10deg) scale(0.9);
        }

        .button-text {
            display: flex;
            flex-direction: column;
            line-height: 1.2;
            transition: transform 0.2s ease-out;
            position: relative;
            z-index: 2;
            text-align: left;
        }

        .brutalist-button:hover .button-text {
            transform: skew(-5deg);
        }

        .brutalist-button:active .button-text {
            transform: skew(5deg);
        }

        .button-text span:first-child {
            font-size: 11px;
            text-transform: uppercase;
        }

        .button-text span:last-child {
            font-size: 16px;
            text-transform: uppercase;
        }
    `;

        document.head.appendChild(style);

        const button = document.createElement("button");

        button.id = "pp-open-showdown";
        button.type = "button";
        button.className = "brutalist-button";

        button.innerHTML = `
        <div class="ms-logo">
            <svg
                class="pokeball-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1000 1000"
            >
                <circle cx="500" cy="500" r="360" fill="#fff"/>

                <path
                    d="M 140 500 A 360 360 0 0 1 860 500 H 640 A 140 140 0 0 0 360 500 Z"
                    fill="#ff1b22"
                />

                <path
                    d="M 600 142 A 360 360 0 0 1 860 500 H 765 A 360 360 0 0 0 600 142 Z"
                    fill="#e5161b"
                />

                <path
                    d="M 765 500 H 860 A 360 360 0 0 1 600 858 A 360 360 0 0 0 765 500 Z"
                    fill="#dedede"
                />

                <rect
                    x="140"
                    y="478"
                    width="720"
                    height="44"
                    fill="#000"
                />

                <circle cx="500" cy="500" r="142" fill="#000"/>
                <circle cx="500" cy="500" r="82" fill="#fff"/>
            </svg>
        </div>

        <div class="button-text">
            <span>View in</span>
            <span>SHOWDOWN</span>
        </div>
    `;

        document.body.appendChild(button);

        button.addEventListener(
            "click",
            function() {
                try {
                    GM_setValue(PASTE_KEY, {
                        url: url,
                        time: Date.now()
                    });
                } catch (_) {}

                window.location.href =
                    "https://play.pokemonshowdown.com/teambuilder";
            }, {
                once: true
            }
        );
    }

    function showdownIsPresent() {
        try {
            const heartbeat =
                GM_getValue(SHOWDOWN_KEY, 0);

            return (
                heartbeat &&
                Date.now() - heartbeat < 1800
            );
        } catch (_) {
            return false;
        }
    }

    function finishCreatedPaste(url) {
        try {
            GM_setValue(PASTE_KEY, {
                url: url,
                time: Date.now()
            });
        } catch (_) {}

        let checks = 0;

        const receiverCheck =
            setInterval(function() {
                checks++;

                if (showdownIsPresent()) {
                    clearInterval(receiverCheck);

                    setTimeout(function() {
                        try {
                            window.close();
                        } catch (_) {}
                    }, 100);

                    return;
                }

                if (checks >= 8) {
                    clearInterval(receiverCheck);
                    showOpenShowdownButton(url);
                }
            }, 150);
    }

    function watchCreatedPaste() {
        let count = 0;

        const timer = setInterval(function() {
            const url = getPasteUrl();

            if (url) {
                clearInterval(timer);
                finishCreatedPaste(url);
                return;
            }

            if (++count >= 100) {
                clearInterval(timer);
            }
        }, 100);
    }

    if (
        location.hostname === "pokepast.es" ||
        location.hostname === "www.pokepast.es"
    ) {
        watchCreatedPaste();
        return;
    }

    if (
        location.hostname !==
        "play.pokemonshowdown.com"
    ) {
        return;
    }

    function receivePokepaste(value) {
        const url =
            typeof value === "string" ?
            value :
            value && value.url;

        const time =
            typeof value === "object" && value ?
            Number(value.time) :
            0;

        if (
            !/^https:\/\/pokepast\.es\/[A-Za-z0-9_-]+$/.test(
                url || ""
            ) ||
            !time ||
            Date.now() - time > 120000
        ) {
            return;
        }

        try {
            sessionStorage.setItem(
                "ps-pokepaste-pending-link",
                url
            );
        } catch (_) {}

        const open = () => {
            try {
                if (
                    window.app &&
                    typeof window.app.addRoom ===
                    "function"
                ) {
                    window.app.addRoom("teambuilder");
                }

                if (
                    window.app &&
                    typeof window.app.focusRoom ===
                    "function"
                ) {
                    window.app.focusRoom("teambuilder");
                }
            } catch (_) {}
        };

        open();

        let attempts = 0;
        const timer = setInterval(function() {
            attempts++;
            open();

            if (
                document.getElementById(
                    "room-teambuilder"
                ) ||
                attempts >= 60
            ) {
                clearInterval(timer);
            }
        }, 100);

        try {
            GM_setValue(PASTE_KEY, "");
        } catch (_) {}
    }

    function announceShowdown() {
        try {
            GM_setValue(
                SHOWDOWN_KEY,
                Date.now()
            );
        } catch (_) {}
    }

    announceShowdown();

    setInterval(
        announceShowdown,
        500
    );

    GM_addValueChangeListener(
        PASTE_KEY,
        function(_, __, value) {
            receivePokepaste(value);
        }
    );

    try {
        const pending = GM_getValue(
            PASTE_KEY,
            null
        );

        if (pending) {
            receivePokepaste(pending);
        }
    } catch (_) {}

    function bindUpload() {
        const button =
            document.querySelector(
                'button[name="pokepasteExport"],input[name="pokepasteExport"]'
            );

        if (
            !button ||
            button.dataset.pokepasteModuleV4 === "1"
        ) {
            return;
        }

        const form =
            button.closest("form");

        if (!form) {
            return;
        }

        button.dataset.pokepasteModuleV4 = "1";

        button.addEventListener(
            "click",
            function() {
                if (window[PASTE_LOCK]) {
                    return;
                }

                const popupName =
                    "PokepasteCreate_" +
                    Date.now();

                const popup =
                    window.open(
                        "https://pokepast.es/create",
                        popupName,
                        "popup=yes,width=420,height=300,left=-10000,top=-10000"
                    );

                if (!popup) {
                    return;
                }

                window[PASTE_LOCK] = true;

                /*
                 * Give the native Showdown submit exactly one
                 * target. We don't submit the form ourselves.
                 */
                const oldTarget =
                    form.getAttribute("target");

                form.setAttribute(
                    "target",
                    popupName
                );

                setTimeout(function() {
                    if (oldTarget === null) {
                        form.removeAttribute("target");
                    } else {
                        form.setAttribute(
                            "target",
                            oldTarget
                        );
                    }
                }, 1000);

                setTimeout(function() {
                    window[PASTE_LOCK] = false;
                }, 15000);
            },
            true
        );
    }

    bindUpload();

    new MutationObserver(
        bindUpload
    ).observe(
        document.documentElement, {
            childList: true,
            subtree: true
        }
    );

})();

// ============================================================
// THEME SELECTOR
// ============================================================
// BUTTON TRANSFER
function transferWatchButton() {
    const watch = [...document.querySelectorAll('.mainmenu button.mainmenu4')]
        .find(b => b.innerText.includes('Watch A Battle'));

    if (!watch) return;

    const rightMenu = document.querySelector('.rightmenu .menugroup');

    if (!rightMenu || watch.parentElement?.parentElement === rightMenu) return;

    const p = document.createElement('p');
    p.appendChild(watch);
    rightMenu.appendChild(p);

    const resources = document.querySelector(
        'button.button.mainmenu7[name="joinRoom"][value="resources"]'
    );

    if (resources) {
        [...resources.childNodes]
        .find(n => n.nodeType === Node.TEXT_NODE)
            ?.replaceWith('User Manual');
    }
}

transferWatchButton();

setInterval(transferWatchButton, 10);
// ============================================================
// /ROOMS — RIGHT SIDE MINI BROWSER
// ============================================================

(function() {

    "use strict";


    /* ============================================================
       CONSTANTS
       ============================================================ */

    const ROOMS_ROOM_ID =
        "room-rooms";

    const ROOMS_PANEL_ID =
        "room-rooms-panel";

    const ROOMS_STORAGE_KEY =
        "rooms-browser-tabs";


    /* ============================================================
       STATE
       ============================================================ */

    let roomsTabs = [];

    let activeRoomsTabId = null;

    let roomsIframe = null;


    /* ============================================================
       STORAGE
       ============================================================ */

    function saveRoomsTabs() {

        try {

            localStorage.setItem(
                ROOMS_STORAGE_KEY,
                JSON.stringify({
                    tabs: roomsTabs,
                    activeTabId: activeRoomsTabId
                })
            );

        } catch (error) {}

    }


    function loadRoomsTabs() {

        roomsTabs = [];

        activeRoomsTabId = null;


        try {

            const saved =
                localStorage.getItem(
                    ROOMS_STORAGE_KEY
                );


            if (saved) {

                const parsed =
                    JSON.parse(saved);


                if (
                    parsed &&
                    Array.isArray(parsed.tabs)
                ) {

                    roomsTabs =
                        parsed.tabs.filter(
                            tab =>
                            tab &&
                            tab.id
                        );

                    activeRoomsTabId =
                        parsed.activeTabId ||
                        null;

                }

            }

        } catch (error) {}


        /* --------------------------------------------------------
           If nothing is saved, create one blank tab
           -------------------------------------------------------- */

        if (!roomsTabs.length) {

            const tab =
                createBlankRoomsTab();

            roomsTabs.push(tab);

            activeRoomsTabId =
                tab.id;

        }


        /* --------------------------------------------------------
           Make sure active tab exists
           -------------------------------------------------------- */

        if (
            !roomsTabs.some(
                tab =>
                tab.id ===
                activeRoomsTabId
            )
        ) {

            activeRoomsTabId =
                roomsTabs[0].id;

        }


        saveRoomsTabs();

    }


    /* ============================================================
       TAB CREATION
       ============================================================ */

    function createBlankRoomsTab() {

        return {

            id: "rooms-" +
                Date.now() +
                "-" +
                Math.random()
                .toString(36)
                .slice(2),

            name: "New Tab",

            url: ""

        };

    }


    function getActiveRoomsTab() {

        return roomsTabs.find(
            tab =>
            tab.id ===
            activeRoomsTabId
        ) || null;

    }


    /* ============================================================
       HOSTNAME
       ============================================================ */

    function getRoomsHostname(url) {

        try {

            return new URL(url).hostname;

        } catch {

            return "New Tab";

        }

    }


    /* ============================================================
       SAVE CURRENT INPUT

       IMPORTANT:
       This does NOT change iframe.src.
       ============================================================ */

    function saveCurrentRoomsURL() {

        const panel =
            document.getElementById(
                ROOMS_PANEL_ID
            );

        if (!panel) return;


        const input =
            panel.querySelector(
                ".rooms-url"
            );

        if (!input) return;


        const tab =
            getActiveRoomsTab();

        if (!tab) return;


        const value =
            input.value.trim();


        /*
         * Only save the value.
         *
         * DO NOT load it.
         * DO NOT touch iframe.src.
         */

        if (value !== tab.url) {

            tab.url =
                value;

            saveRoomsTabs();

        }

    }


    /* ============================================================
       TAB NAME
       ============================================================ */

    function updateRoomsTabName(
        tab,
        iframe
    ) {

        if (!tab) return;


        let pageTitle =
            "";


        /*
         * Cross-origin iframe access may throw.
         * That's okay.
         */

        try {

            pageTitle =
                iframe.contentDocument &&
                iframe.contentDocument.title ?
                iframe.contentDocument.title.trim() :
                "";

        } catch (error) {}


        if (!pageTitle) {

            pageTitle =
                getRoomsHostname(
                    tab.url
                );

        }


        if (
            pageTitle &&
            tab.name !== pageTitle
        ) {

            tab.name =
                pageTitle;

            saveRoomsTabs();

            renderRoomsTabs();

        }

    }


    /* ============================================================
       RENDER TABS
       ============================================================ */

    function renderRoomsTabs() {

        const panel =
            document.getElementById(
                ROOMS_PANEL_ID
            );

        if (!panel) return;


        const tabsContainer =
            panel.querySelector(
                ".rooms-tabs"
            );

        if (!tabsContainer) return;


        tabsContainer.innerHTML =
            "";


        roomsTabs.forEach(
            tab => {

                const tabButton =
                    document.createElement(
                        "div"
                    );


                tabButton.className =
                    "rooms-tab" +
                    (
                        tab.id ===
                        activeRoomsTabId ?
                        " active" :
                        ""
                    );


                /* ------------------------------------------------
                   Tab name
                   ------------------------------------------------ */

                const name =
                    document.createElement(
                        "span"
                    );


                name.className =
                    "rooms-tab-name";


                name.textContent =
                    tab.name ||
                    "New Tab";


                name.title =
                    tab.name ||
                    "New Tab";


                /* ------------------------------------------------
                   Close button
                   ------------------------------------------------ */

                const close =
                    document.createElement(
                        "button"
                    );


                close.className =
                    "rooms-tab-close";


                close.type =
                    "button";


                close.textContent =
                    "×";


                close.title =
                    "Close Tab";


                /* ------------------------------------------------
                   Tab click
                   ------------------------------------------------ */

                tabButton.addEventListener(
                    "click",
                    function() {

                        switchRoomsTab(
                            tab.id
                        );

                    }
                );


                /* ------------------------------------------------
                   Close click
                   ------------------------------------------------ */

                close.addEventListener(
                    "click",
                    function(event) {

                        event.preventDefault();

                        event.stopPropagation();

                        closeRoomsTab(
                            tab.id
                        );

                    }
                );


                tabButton.appendChild(
                    name
                );


                tabButton.appendChild(
                    close
                );


                tabsContainer.appendChild(
                    tabButton
                );

            }
        );


        /* ========================================================
           NEW TAB BUTTON
           ======================================================== */

        const add =
            document.createElement(
                "button"
            );


        add.className =
            "rooms-tab-add";


        add.type =
            "button";


        add.textContent =
            "+";


        add.title =
            "New Tab";


        add.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                event.stopPropagation();

                createRoomsTab();

            }
        );


        tabsContainer.appendChild(
            add
        );

    }


    /* ============================================================
       CREATE TAB
       ============================================================ */

    function createRoomsTab() {

        saveCurrentRoomsURL();


        const tab =
            createBlankRoomsTab();


        roomsTabs.push(
            tab
        );


        activeRoomsTabId =
            tab.id;


        saveRoomsTabs();

        renderRoomsTabs();

        syncRoomsActiveTabUI();

    }


    /* ============================================================
       SWITCH TAB
       ============================================================ */

    function switchRoomsTab(id) {

        saveCurrentRoomsURL();


        const target =
            roomsTabs.find(
                tab =>
                tab.id === id
            );


        if (!target) return;


        activeRoomsTabId =
            id;


        saveRoomsTabs();

        renderRoomsTabs();

        syncRoomsActiveTabUI();


        /*
         * IMPORTANT:
         *
         * iframe.src is changed ONLY because
         * the user explicitly switched tabs.
         */

        loadRoomsIframeForTab(
            target
        );

    }


    /* ============================================================
       CLOSE TAB
       ============================================================ */

    function closeRoomsTab(id) {

        const index =
            roomsTabs.findIndex(
                tab =>
                tab.id === id
            );


        if (index === -1) return;


        const wasActive =
            activeRoomsTabId === id;


        roomsTabs.splice(
            index,
            1
        );


        /* --------------------------------------------------------
           Always keep one tab
           -------------------------------------------------------- */

        if (!roomsTabs.length) {

            const tab =
                createBlankRoomsTab();


            roomsTabs.push(
                tab
            );


            activeRoomsTabId =
                tab.id;

        }


        /* --------------------------------------------------------
           Choose another tab if active one was closed
           -------------------------------------------------------- */
        else if (wasActive) {

            const nextIndex =
                Math.max(
                    0,
                    Math.min(
                        index - 1,
                        roomsTabs.length - 1
                    )
                );


            activeRoomsTabId =
                roomsTabs[
                    nextIndex
                ].id;

        }


        saveRoomsTabs();

        renderRoomsTabs();

        syncRoomsActiveTabUI();


        /*
         * Explicit tab close is allowed to change
         * the iframe.
         */

        const active =
            getActiveRoomsTab();


        if (active) {

            loadRoomsIframeForTab(
                active
            );

        }

    }


    /* ============================================================
       SHOW CUSTOM 404
       ============================================================ */

    function showRooms404() {

        const panel =
            document.getElementById(
                ROOMS_PANEL_ID
            );

        if (!panel) return;


        const content =
            panel.querySelector(
                ".rooms-content"
            );

        if (!content) return;


        content.style.display =
            "block";


        if (roomsIframe) {

            roomsIframe.style.display =
                "none";

        }


        content.innerHTML = `

            <div class="ps-pp-404">

                <div class="ps-pp-404-image">

                    <img
                        src="https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/404-error.gif"
                        alt="404"
                    >

                </div>


                <div class="ps-pp-404-txt">

                    Oops! A wild Snorlax has blocked your path.

                </div>


                <div class="ps-pp-404-title">

                    ( PokéPaste Not Found )

                </div>


                <div class="ps-pp-404-buttons">

                    <button
                        type="button"
                        class="ps-pp-force button big"
                    >
                        Push him away!
                    </button>


                    <button
                        type="button"
                        class="ps-pp-home button big"
                    >
                        Go Back Home!
                    </button>

                </div>

            </div>

        `;


        /* --------------------------------------------------------
           Force button
           -------------------------------------------------------- */

        const force =
            content.querySelector(
                ".ps-pp-force"
            );


        if (force) {

            force.addEventListener(
                "click",
                function() {

                    content.innerHTML = `

                        <div class="ps-pp-force-image">

                            <video
                                autoplay
                                loop
                                playsinline
                                src="https://cdn-useast1.kapwing.com/static/templates/rick-roll-video-meme-template-video-1da252ec.mp4">
                            </video>

                        </div>

                    `;

                }
            );

        }


        /* --------------------------------------------------------
           Home button
           -------------------------------------------------------- */

        const home =
            content.querySelector(
                ".ps-pp-home"
            );


        if (home) {

            home.addEventListener(
                "click",
                function() {

                    const active =
                        getActiveRoomsTab();


                    if (active) {

                        active.url =
                            "";

                        active.name =
                            "New Tab";

                    }


                    saveRoomsTabs();

                    renderRoomsTabs();

                    syncRoomsActiveTabUI();

                    /*
                     * We intentionally do NOT change
                     * iframe.src here.
                     */

                }
            );

        }

    }


    /* ============================================================
       LOAD IFRAME FOR TAB

       THIS IS THE ONLY FUNCTION THAT LOADS A URL.
       ============================================================ */

    function loadRoomsIframeForTab(tab) {

        if (!tab) return;


        const panel =
            document.getElementById(
                ROOMS_PANEL_ID
            );

        if (!panel) return;


        const content =
            panel.querySelector(
                ".rooms-content"
            );

        if (!content) return;


        if (!roomsIframe) {

            roomsIframe =
                panel.querySelector(
                    ".rooms-iframe"
                );

        }


        if (!roomsIframe) return;


        /* --------------------------------------------------------
           Blank tab
           -------------------------------------------------------- */

        if (!tab.url) {

            roomsIframe.style.display =
                "none";


            content.style.display =
                "none";


            /*
             * DO NOT set iframe.src here.
             *
             * Leaving the previous document alone prevents
             * unnecessary navigation.
             */

            return;

        }


        /* --------------------------------------------------------
           Loaded tab
           -------------------------------------------------------- */

        content.style.display =
            "block";


        roomsIframe.style.display =
            "block";


        /*
         * Only navigate if the URL is actually different.
         */

        const currentSrc =
            roomsIframe.getAttribute(
                "src"
            ) || "";


        if (
            currentSrc !==
            tab.url
        ) {

            roomsIframe.setAttribute(
                "src",
                tab.url
            );

        }

    }


    /* ============================================================
       SEARCH / ENTER
       ============================================================ */

    function loadRoomsURL(value) {

        const panel =
            document.getElementById(
                ROOMS_PANEL_ID
            );

        if (!panel) return;


        const input =
            panel.querySelector(
                ".rooms-url"
            );


        const content =
            panel.querySelector(
                ".rooms-content"
            );


        if (
            !input ||
            !content
        ) {
            return;
        }


        let url =
            value.trim();


        if (!url) return;


        /* --------------------------------------------------------
           Add HTTPS
           -------------------------------------------------------- */

        if (
            !/^https?:\/\//i.test(
                url
            )
        ) {

            url =
                "https://" +
                url;

        }


        const tab =
            getActiveRoomsTab();


        if (!tab) return;


        /*
         * If the user searched the exact same URL,
         * DO NOT reload it.
         */

        if (
            tab.url === url
        ) {

            input.value =
                url;

            return;

        }


        /* --------------------------------------------------------
           Save new URL
           -------------------------------------------------------- */

        tab.url =
            url;


        tab.name =
            getRoomsHostname(
                url
            );


        input.value =
            url;


        saveRoomsTabs();

        renderRoomsTabs();


        /* --------------------------------------------------------
           Load ONLY because Search / Enter was used
           -------------------------------------------------------- */

        loadRoomsIframeForTab(
            tab
        );

    }


    /* ============================================================
       SYNC UI

       IMPORTANT:
       This function NEVER changes iframe.src.
       ============================================================ */

    function syncRoomsActiveTabUI() {

        const panel =
            document.getElementById(
                ROOMS_PANEL_ID
            );

        if (!panel) return;


        const input =
            panel.querySelector(
                ".rooms-url"
            );


        const content =
            panel.querySelector(
                ".rooms-content"
            );


        if (
            !input ||
            !content
        ) {
            return;
        }


        const tab =
            getActiveRoomsTab();


        if (
            !tab ||
            !tab.url
        ) {

            input.value =
                "";


            content.style.display =
                "none";


            /*
             * IMPORTANT:
             * No iframe.src modification.
             */

            if (roomsIframe) {

                roomsIframe.style.display =
                    "none";

            }


            return;

        }


        input.value =
            tab.url;


        content.style.display =
            "block";


        if (roomsIframe) {

            roomsIframe.style.display =
                "block";

        }

    }


    /* ============================================================
       CREATE ROOMS UI
       ============================================================ */

    function createRoomsUI(panel) {

        if (
            panel.querySelector(
                ".rooms-tabs"
            )
        ) {
            return;
        }


        /* ========================================================
           TABS
           ======================================================== */

        const tabs =
            document.createElement(
                "div"
            );


        tabs.className =
            "rooms-tabs";


        panel.appendChild(
            tabs
        );


        /* ========================================================
           URL BAR
           ======================================================== */

        const urlBar =
            document.createElement(
                "div"
            );


        urlBar.className =
            "rooms-url-bar";


        const url =
            document.createElement(
                "input"
            );


        url.className =
            "rooms-url";


        url.type =
            "text";


        url.placeholder =
            "Enter URL...";


        url.autocomplete =
            "off";


        url.spellcheck =
            false;


        /* --------------------------------------------------------
           Search button
           -------------------------------------------------------- */

        const search =
            document.createElement(
                "button"
            );


        search.className =
            "rooms-url-search";


        search.type =
            "button";


        search.textContent =
            "Search";


        search.title =
            "Open URL";


        /* --------------------------------------------------------
           Enter
           -------------------------------------------------------- */

        url.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    event.stopPropagation();

                    loadRoomsURL(
                        url.value
                    );

                }

            }
        );


        /* --------------------------------------------------------
           Search click
           -------------------------------------------------------- */

        search.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                event.stopPropagation();

                loadRoomsURL(
                    url.value
                );

            }
        );


        urlBar.appendChild(
            url
        );


        urlBar.appendChild(
            search
        );


        panel.appendChild(
            urlBar
        );


        /* ========================================================
           CONTENT
           ======================================================== */

        const content =
            document.createElement(
                "div"
            );


        content.className =
            "rooms-content";


        content.style.display =
            "none";


        panel.appendChild(
            content
        );


        /* ========================================================
           SINGLE IFRAME
           ======================================================== */

        roomsIframe =
            document.createElement(
                "iframe"
            );


        roomsIframe.className =
            "rooms-iframe";


        roomsIframe.setAttribute(
            "frameborder",
            "0"
        );


        roomsIframe.setAttribute(
            "allowfullscreen",
            ""
        );


        roomsIframe.style.display =
            "none";


        /*
         * Start completely blank.
         */

        roomsIframe.src =
            "about:blank";


        /* --------------------------------------------------------
           IFRAME LOAD
           -------------------------------------------------------- */

        roomsIframe.addEventListener(
            "load",
            function() {

                const active =
                    getActiveRoomsTab();


                if (!active) return;


                /*
                 * ONLY update the tab title.
                 *
                 * NEVER change iframe.src.
                 */

                updateRoomsTabName(
                    active,
                    roomsIframe
                );

            }
        );


        /* --------------------------------------------------------
           IFRAME ERROR
           -------------------------------------------------------- */

        roomsIframe.addEventListener(
            "error",
            function() {

                /*
                 * Browser iframe error events are not reliable
                 * for cross-origin X-Frame-Options/CSP blocking.
                 *
                 * This catches errors when the browser does
                 * actually expose an iframe error event.
                 */

                showRooms404();

            }
        );


        content.appendChild(
            roomsIframe
        );


        /* ========================================================
           LOAD SAVED STATE
           ======================================================== */

        loadRoomsTabs();

        renderRoomsTabs();

        syncRoomsActiveTabUI();


        /*
         * IMPORTANT:
         *
         * We intentionally do NOT call
         * loadRoomsIframeForTab() here.
         *
         * This prevents the panel from automatically
         * reloading the saved iframe every time the
         * UI gets recreated.
         *
         * If the panel was genuinely recreated after
         * navigating away from Rooms, load the saved
         * URL once below.
         */

        const active =
            getActiveRoomsTab();


        if (
            active &&
            active.url
        ) {

            loadRoomsIframeForTab(
                active
            );

        }

    }


    /* ============================================================
       IS ROOMS ACTIVE
       ============================================================ */

    function isRoomsActive() {

        const room =
            document.getElementById(
                ROOMS_ROOM_ID
            );


        if (!room) {

            return false;

        }


        const tab =
            document.querySelector(
                '[aria-controls="room-rooms"]'
            );


        if (tab) {

            if (
                tab.classList.contains(
                    "active"
                ) ||
                tab.getAttribute(
                    "aria-selected"
                ) === "true"
            ) {

                return true;

            }

        }


        const style =
            getComputedStyle(
                room
            );


        if (
            style.display ===
            "none" ||
            style.visibility ===
            "hidden"
        ) {

            return false;

        }


        return true;

    }


    /* ============================================================
       CREATE PANEL
       ============================================================ */

    function createRoomsPanel() {

        const existing =
            document.getElementById(
                ROOMS_PANEL_ID
            );


        if (existing) {

            /*
             * CRITICAL:
             *
             * If the panel already exists,
             * DO NOTHING.
             *
             * Do not recreate iframe.
             * Do not reload URL.
             */

            return;

        }


        const panel =
            document.createElement(
                "div"
            );


        panel.id =
            ROOMS_PANEL_ID;


        panel.className =
            "ps-room ps-room-light scrollable";


        document.body.appendChild(
            panel
        );


        createRoomsUI(
            panel
        );

    }


    /* ============================================================
       REMOVE PANEL
       ============================================================ */

    function removeRoomsPanel() {

        const panel =
            document.getElementById(
                ROOMS_PANEL_ID
            );


        if (!panel) return;


        /*
         * Save only.
         *
         * Do not modify stored tabs.
         */

        saveCurrentRoomsURL();


        /*
         * The panel disappears when native Rooms
         * is no longer active.
         *
         * localStorage remains untouched.
         */

        panel.remove();


        /*
         * Clear JavaScript reference.
         */

        roomsIframe =
            null;

    }


    /* ============================================================
       ROOMS CHECK
       ============================================================ */

    function checkRooms() {

        const active =
            isRoomsActive();


        if (active) {

            createRoomsPanel();

        } else {

            removeRoomsPanel();

        }

    }


    /* ============================================================
       MUTATION OBSERVER

       IMPORTANT:
       This observer ONLY checks whether the native Rooms
       room is visible.

       It NEVER touches iframe.src.
       ============================================================ */

    let checkTimer =
        null;


    function scheduleCheck() {

        if (checkTimer) {
            return;
        }


        checkTimer =
            setTimeout(
                function() {

                    checkTimer =
                        null;

                    checkRooms();

                },
                40
            );

    }


    const observer =
        new MutationObserver(
            function() {

                scheduleCheck();

            }
        );


    observer.observe(
        document.body, {
            childList: true,

            subtree: true,

            attributes: true,

            attributeFilter: [
                "class",
                "style",
                "aria-selected"
            ]
        }
    );


    /* ============================================================
       INITIAL CHECK
       ============================================================ */

    checkRooms();


})();

(function() {
    "use strict";

    const style = document.createElement("style");

    style.textContent = `

    /* FOR LATER USE */

    `;

    document.head.appendChild(style);


})();

// NEWS


// Shared Resources scrolling helpers.
// Defined independently so TOC buttons work even if the News window is unavailable.
(function() {
    function scrollResourceTarget(target) {
        if (!target) return false;

        let p = target.parentElement;

        while (p && p !== document.body) {
            const style = getComputedStyle(p);

            if (
                /auto|scroll|overlay/.test(style.overflowY) &&
                p.scrollHeight > p.clientHeight + 4
            ) {
                const r = p.getBoundingClientRect();
                const tr = target.getBoundingClientRect();

                p.scrollTo({
                    top: p.scrollTop + tr.top - r.top - 18,
                    behavior: "smooth"
                });

                return true;
            }

            p = p.parentElement;
        }

        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        return true;
    }

    window.scrollToResourceSection = function(id) {
        const target = document.getElementById(id);
        if (!target) return false;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                scrollResourceTarget(target);
            });
        });

        return true;
    };

    window.openResourcesAndScrollWhatNew = function() {
        const btn = document.querySelector(
            'button[name="joinRoom"][value="resources"]'
        );

        if (!btn) return false;

        btn.click();

        let attempts = 0;
        const maxAttempts = 40;

        const findAndScroll = () => {
            const target = document.getElementById("what-new");

            if (target) {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        scrollResourceTarget(target);
                    });
                });
                return;
            }

            attempts++;
            if (attempts < maxAttempts) {
                setTimeout(findAndScroll, 100);
            }
        };

        findAndScroll();
        return true;
    };
})();


(function() {

    const newsTitleText =
        "Release Notes - Remastered PS";

    const newsSheetUrl =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vRLG8OAmQqb21ARx14BGv-gkGCKuc4iMGrc6KnS-79pKkmM2pfLDcUz6gDQDdIImgienqIxTRg-LcWH/pub?output=csv";

    const newsCacheKey =
        "ps-remastered-news-v2";

    const newsCacheVersion = 2;


    /*
     * Automatically find the PS News window.
     * No hardcoded data-newsid.
     */
    function findNewsWindow() {

        const windows = [
            ...document.querySelectorAll(
                ".pm-window[data-newsid]"
            )
        ];

        return windows.find(box =>
            box.classList.contains("news-embed") ||
            box.querySelector(".pm-log")
        ) || null;
    }


    const newsOriginal =
        findNewsWindow();

    if (!newsOriginal) return;


    /*
     * Prevent duplicate Remastered News windows.
     */
    const newsAlreadyExists = [...document.querySelectorAll(
        ".pm-window.news-embed"
    )].some(
        box =>
        box.querySelector("h3")?.textContent.trim() ===
        newsTitleText
    );


    if (newsAlreadyExists) return;


    /*
     * Clone the original PS News window.
     */
    const newsBox =
        newsOriginal.cloneNode(true);


    const newsTitle =
        newsBox.querySelector("h3");


    if (newsTitle) {

        newsTitle.classList.remove(
            "pm-minimized"
        );


        newsTitle.childNodes.forEach(
            node => {

                if (
                    node.nodeType ===
                    Node.TEXT_NODE
                ) {

                    node.textContent =
                        newsTitleText;

                }

            }
        );

    }


    /*
     * Replace original news content.
     */
    const newsLog =
        newsBox.querySelector(".pm-log");


    if (!newsLog) return;


    newsLog.innerHTML = `
        <div class="news-custom"></div>
    `;


    newsLog.style.display = "";


    /*
     * Insert our News box.
     */
    newsOriginal.parentNode.insertBefore(
        newsBox,
        newsOriginal
    );


    const newsCustom =
        newsBox.querySelector(".news-custom");


    if (!newsCustom) return;


    let newsChecking =
        false;


    /*
     * CSV parser.
     */
    function newsParseCSV(text) {

        const rows = [];

        let row = [];
        let cell = "";
        let quotes = false;


        for (
            let i = 0; i < text.length; i++
        ) {

            const char =
                text[i];

            const next =
                text[i + 1];


            if (
                char === '"' &&
                quotes &&
                next === '"'
            ) {

                cell += '"';

                i++;

                continue;

            }


            if (char === '"') {

                quotes = !quotes;

                continue;

            }


            if (
                char === "," &&
                !quotes
            ) {

                row.push(cell);

                cell = "";

                continue;

            }


            if (
                (
                    char === "\n" ||
                    char === "\r"
                ) &&
                !quotes
            ) {

                if (
                    char === "\r" &&
                    next === "\n"
                ) {

                    i++;

                }


                row.push(cell);

                cell = "";


                if (
                    row.some(
                        value =>
                        value.trim() !== ""
                    )
                ) {

                    rows.push(row);

                }


                row = [];

                continue;

            }


            cell += char;

        }


        if (
            cell !== "" ||
            row.length
        ) {

            row.push(cell);


            if (
                row.some(
                    value =>
                    value.trim() !== ""
                )
            ) {

                rows.push(row);

            }

        }


        return rows;

    }


    /*
     * Escape HTML.
     */
    function newsEscapeHTML(value) {

        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    /*
     * Create News entry.
     */
    function newsCreateEntry(
        row,
        headers
    ) {

        const newsData = {};


        headers.forEach(
            (header, index) => {

                newsData[header] =
                    (row[index] || "").trim();

            }
        );


        const date =
            newsData.date || "";

        const author =
            newsData.author || "";

        const title =
            newsData.title || "";

        const description =
            newsData.description || "";

        const customHTML =
            newsData["custom html"] || "";


        if (
            !date &&
            !author &&
            !title &&
            !description &&
            !customHTML
        ) {

            return "";

        }


        return `
            <div class="newsentry">

                ${
                    title
                        ? `
                            <h4>
                                ${newsEscapeHTML(title)}
                            </h4>
                        `
                        : ""
                }


                ${
                    description
                        ? `
                        <p>
    ${newsEscapeHTML(description)}
    <br>
    <a href="/resources" class="news-see-more" data-psr-news-resources="true">
        See what's more
    </a>
</p>
                        `
                        : ""
                }


                ${
                    customHTML
                        ? customHTML
                        : ""
                }


                ${
                    author || date
                        ? `
                            <p>
                                -
                                <strong>
                                    ${newsEscapeHTML(author)}
                                </strong>
                                ${
                                    date
                                        ? `
                                            <small class="date">
                                                on ${newsEscapeHTML(date)}
                                            </small>
                                        `
                                        : ""
                                }
                            </p>
                        `
                        : ""
                }

            </div>
        `;

    }

// Use capture phase so Showdown's own link/navigation handlers cannot
// process the /resources href before this handler cancels it.
if (!window.__psrNewsResourcesClickHandler) {
    window.__psrNewsResourcesClickHandler = true;

    document.addEventListener(
        "click",
        function(e) {
            const link = e.target.closest(
                "a.news-see-more, a[data-psr-news-resources='true']"
            );

            if (!link) return;

            e.preventDefault();
            e.stopPropagation();

            const section =
                link.getAttribute("data-psr-section") ||
                "what-new";

            const btn = document.querySelector(
                'button[name="joinRoom"][value="resources"]'
            );

            if (!btn) return;

            btn.click();

            setTimeout(() => {
                const t =
                    document.getElementById(section);

                if (!t) return;

                let p = t.parentElement;

                while (p && p !== document.body) {
                    const s = getComputedStyle(p);

                    if (
                        /auto|scroll|overlay/.test(s.overflowY) &&
                        p.scrollHeight > p.clientHeight
                    ) {
                        break;
                    }

                    p = p.parentElement;
                }

                if (p && p !== document.body) {
                    const r = p.getBoundingClientRect();
                    const tr = t.getBoundingClientRect();

                    p.scrollTo({
                        top:
                            p.scrollTop +
                            tr.top -
                            r.top -
                            18,
                        behavior: "smooth"
                    });
                } else {
                    t.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            }, 1000);
        },
        true
    );
}
    /*
     * Get latest spreadsheet row.
     */
    function newsGetLatest(csv) {

        const rows =
            newsParseCSV(csv);


        if (
            rows.length < 2
        ) {

            return null;

        }


        const headers =
            rows[0].map(
                header =>
                header
                .trim()
                .toLowerCase()
            );


        const newsRows =
            rows
            .slice(1)
            .filter(
                row =>
                row.some(
                    value =>
                    value.trim() !== ""
                )
            );


        const lastRow =
            newsRows[
                newsRows.length - 1
            ];


        if (!lastRow) {

            return null;

        }


        return {

            row: lastRow,

            headers: headers

        };

    }


    /*
     * Create cache fingerprint.
     */
    function newsFingerprint(row) {

        return JSON.stringify(
            row.map(
                value =>
                String(value).trim()
            )
        );

    }


    /*
     * Read cache.
     */
    function newsGetCache() {

        try {

            const cached =
                localStorage.getItem(
                    newsCacheKey
                );


            if (!cached) {

                return null;

            }


            const data =
                JSON.parse(
                    cached
                );


            if (
                !data ||
                data.version !== newsCacheVersion ||
                !data.fingerprint ||
                !data.html
            ) {

                return null;

            }


            return data;

        } catch (error) {

            console.error(
                "[PS Remastered News Cache]",
                error
            );

            return null;

        }

    }


    /*
     * Load cached News.
     */
    function newsLoadCache() {

        const cached =
            newsGetCache();


        if (!cached) return;


        newsCustom.innerHTML =
            cached.html;

    }


    /*
     * Save News cache.
     */
    function newsSaveCache(
        fingerprint,
        html
    ) {

        try {

            localStorage.setItem(
                newsCacheKey,
                JSON.stringify({
                    version: newsCacheVersion,
                    fingerprint: fingerprint,
                    html: html
                })
            );


            return true;

        } catch (error) {

            console.error(
                "[PS Remastered News Cache]",
                error
            );

            return false;

        }

    }


    /*
     * Check spreadsheet for latest News.
     */
    async function newsCheckLatest() {

        if (newsChecking) {

            return;

        }


        newsChecking =
            true;


        try {

            const response =
                await fetch(
                    newsSheetUrl +
                    "&_=" +
                    Date.now(), {
                        cache: "no-store"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Failed to fetch spreadsheet"
                );

            }


            const csv =
                await response.text();


            const latest =
                newsGetLatest(
                    csv
                );


            if (!latest) {

                return;

            }


            const fingerprint =
                newsFingerprint(
                    latest.row
                );


            const cached =
                newsGetCache();


            if (
                cached &&
                cached.fingerprint ===
                fingerprint
            ) {

                return;

            }


            const html =
                newsCreateEntry(
                    latest.row,
                    latest.headers
                );


            if (!html) {

                return;

            }


            const saved =
                newsSaveCache(
                    fingerprint,
                    html
                );


            if (!saved) {

                return;

            }


            newsCustom.innerHTML =
                html;


        } catch (error) {

            console.error(
                "[PS Remastered News]",
                error
            );

        } finally {

            newsChecking =
                false;

        }

    }


    /*
     * Initial load.
     */
    newsLoadCache();

    newsCheckLatest();


    /*
     * Update every minute.
     */
    setInterval(
        newsCheckLatest,
        60 * 1000
    );


})();


// GUIDE FOR THE PS REMASTERED


(function() {

    const customHTML = `
    <div class="psr-guide">
	<section class="psr-hero">
		<div class="psr-hero-logo"> <img class="logo" src="https://play.pokemonshowdown.com/pokemonshowdownbeta.png" srcset="https://play.pokemonshowdown.com/pokemonshowdownbeta@2x.png 2x" alt="Pokémon Showdown! (beta)" width="146" height="44" data-sprite-fallback-setup="true">
			<h2>Pokémon Showdown Remastered</h2> </div>
		<p> A refreshed Pokémon Showdown experience focused on cleaner visuals, improved sprites, useful battle enhancements, and quality-of-life improvements. </p>
		<p class="psr-hero-subtitle"> ✨ Built to make Pokémon Showdown feel cleaner, smoother, and more enjoyable. </p>
	</section>
	<section id="about" class="psr-section">
		<div class="psr-feature">
			<div class="psr-feature-content">
				<h3>💙 About Us</h3>
				<p> Pokémon Showdown Remastered is a <strong>
                        custom
                    client
                    </strong> experience focused on improving the presentation and usability of Pokémon Showdown. </p>
				<p> <strong>The goal is simple:</strong> Keep the familiar Pokémon Showdown experience while adding <strong>
                        visual improvements, refreshed resources,
                    useful quality-of-life features, and a
                    more polished interface.
                    </strong> </p>
				<p> 🌟 This is a community-focused project and is <strong>Not Affiliated</strong> with or officially endorsed by Pokémon Showdown or The Pokémon Company. </p>
			</div>
			<div class="about-us-image"> <img src="https://i.redd.it/3hydakwumwgb1.gif" alt="RemasteredPS"> </div>
		</div>
	</section>
	<nav id="psr-table-of-contents" class="psr-toc" aria-label="Resources navigation">
		<div class="psr-toc-header">
			<h2>📚 Table of Contents</h2>
			<p>Jump directly to any section of the RemasteredPS resources.</p>
		</div>
		<div class="psr-toc-grid">
			<a class="psr-toc-link" href="#about" onclick="event.preventDefault();var t=document.getElementById('about');if(!t)return;var p=t.parentElement;while(p&&p!==document.body){var s=getComputedStyle(p);if(/auto|scroll|overlay/.test(s.overflowY)&&p.scrollHeight>p.clientHeight)break;p=p.parentElement;}if(p&&p!==document.body){var r=p.getBoundingClientRect(),tr=t.getBoundingClientRect();p.scrollTo({top:p.scrollTop+tr.top-r.top-18,behavior:'smooth'});}else{t.scrollIntoView({behavior:'smooth',block:'start'});}"> <span class="psr-toc-number">01</span> <span class="psr-toc-label">About Us</span>
				<svg class="psr-toc-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true">
					<path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zm41-159c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l39-39-150.1 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l150.1 0-39-39c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l80 80c9.4 9.4 9.4 24.6 0 33.9l-80 80z" /> </svg>
			</a>
			<a class="psr-toc-link" href="#what-new" onclick="event.preventDefault();var t=document.getElementById('what-new');if(!t)return;var p=t.parentElement;while(p&&p!==document.body){var s=getComputedStyle(p);if(/auto|scroll|overlay/.test(s.overflowY)&&p.scrollHeight>p.clientHeight)break;p=p.parentElement;}if(p&&p!==document.body){var r=p.getBoundingClientRect(),tr=t.getBoundingClientRect();p.scrollTo({top:p.scrollTop+tr.top-r.top-18,behavior:'smooth'});}else{t.scrollIntoView({behavior:'smooth',block:'start'});}"> <span class="psr-toc-number">02</span> <span class="psr-toc-label">What's New</span>
				<svg class="psr-toc-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true">
					<path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zm41-159c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l39-39-150.1 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l150.1 0-39-39c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l80 80c9.4 9.4 9.4 24.6 0 33.9l-80 80z" /> </svg>
			</a>
			<a class="psr-toc-link" href="#installation" onclick="event.preventDefault();var t=document.getElementById('installation');if(!t)return;var p=t.parentElement;while(p&&p!==document.body){var s=getComputedStyle(p);if(/auto|scroll|overlay/.test(s.overflowY)&&p.scrollHeight>p.clientHeight)break;p=p.parentElement;}if(p&&p!==document.body){var r=p.getBoundingClientRect(),tr=t.getBoundingClientRect();p.scrollTo({top:p.scrollTop+tr.top-r.top-18,behavior:'smooth'});}else{t.scrollIntoView({behavior:'smooth',block:'start'});}"> <span class="psr-toc-number">03</span> <span class="psr-toc-label">Updates / Installation</span>
				<svg class="psr-toc-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true">
					<path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zm41-159c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l39-39-150.1 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l150.1 0-39-39c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l80 80c9.4 9.4 9.4 24.6 0 33.9l-80 80z" /> </svg>
			</a>
			<a class="psr-toc-link" href="#features" onclick="event.preventDefault();var t=document.getElementById('features');if(!t)return;var p=t.parentElement;while(p&&p!==document.body){var s=getComputedStyle(p);if(/auto|scroll|overlay/.test(s.overflowY)&&p.scrollHeight>p.clientHeight)break;p=p.parentElement;}if(p&&p!==document.body){var r=p.getBoundingClientRect(),tr=t.getBoundingClientRect();p.scrollTo({top:p.scrollTop+tr.top-r.top-18,behavior:'smooth'});}else{t.scrollIntoView({behavior:'smooth',block:'start'});}"> <span class="psr-toc-number">04</span> <span class="psr-toc-label">Features</span>
				<svg class="psr-toc-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true">
					<path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zm41-159c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l39-39-150.1 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l150.1 0-39-39c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l80 80c9.4 9.4 9.4 24.6 0 33.9l-80 80z" /> </svg>
			</a>
			<a class="psr-toc-link" href="#patch-logs" onclick="event.preventDefault();var t=document.getElementById('patch-logs');if(!t)return;var p=t.parentElement;while(p&&p!==document.body){var s=getComputedStyle(p);if(/auto|scroll|overlay/.test(s.overflowY)&&p.scrollHeight>p.clientHeight)break;p=p.parentElement;}if(p&&p!==document.body){var r=p.getBoundingClientRect(),tr=t.getBoundingClientRect();p.scrollTo({top:p.scrollTop+tr.top-r.top-18,behavior:'smooth'});}else{t.scrollIntoView({behavior:'smooth',block:'start'});}"> <span class="psr-toc-number">05</span> <span class="psr-toc-label">Patch Logs</span>
				<svg class="psr-toc-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true">
					<path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zm41-159c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l39-39-150.1 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l150.1 0-39-39c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l80 80c9.4 9.4 9.4 24.6 0 33.9l-80 80z" /> </svg>
			</a>
			<a class="psr-toc-link" href="#feedback" onclick="event.preventDefault();var t=document.getElementById('feedback');if(!t)return;var p=t.parentElement;while(p&&p!==document.body){var s=getComputedStyle(p);if(/auto|scroll|overlay/.test(s.overflowY)&&p.scrollHeight>p.clientHeight)break;p=p.parentElement;}if(p&&p!==document.body){var r=p.getBoundingClientRect(),tr=t.getBoundingClientRect();p.scrollTo({top:p.scrollTop+tr.top-r.top-18,behavior:'smooth'});}else{t.scrollIntoView({behavior:'smooth',block:'start'});}"> <span class="psr-toc-number">06</span> <span class="psr-toc-label">Feedback</span>
				<svg class="psr-toc-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true">
					<path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zm41-159c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l39-39-150.1 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l150.1 0-39-39c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l80 80c9.4 9.4 9.4 24.6 0 33.9l-80 80z" /> </svg>
			</a>
			<a class="psr-toc-link" href="#credits" onclick="event.preventDefault();var t=document.getElementById('credits');if(!t)return;var p=t.parentElement;while(p&&p!==document.body){var s=getComputedStyle(p);if(/auto|scroll|overlay/.test(s.overflowY)&&p.scrollHeight>p.clientHeight)break;p=p.parentElement;}if(p&&p!==document.body){var r=p.getBoundingClientRect(),tr=t.getBoundingClientRect();p.scrollTo({top:p.scrollTop+tr.top-r.top-18,behavior:'smooth'});}else{t.scrollIntoView({behavior:'smooth',block:'start'});}"> <span class="psr-toc-number">07</span> <span class="psr-toc-label">Credits</span>
				<svg class="psr-toc-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true">
					<path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zm41-159c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l39-39-150.1 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l150.1 0-39-39c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l80 80c9.4 9.4 9.4 24.6 0 33.9l-80 80z" /> </svg>
			</a>
			<a class="psr-toc-link" href="#contact" onclick="event.preventDefault();var t=document.getElementById('contact');if(!t)return;var p=t.parentElement;while(p&&p!==document.body){var s=getComputedStyle(p);if(/auto|scroll|overlay/.test(s.overflowY)&&p.scrollHeight>p.clientHeight)break;p=p.parentElement;}if(p&&p!==document.body){var r=p.getBoundingClientRect(),tr=t.getBoundingClientRect();p.scrollTo({top:p.scrollTop+tr.top-r.top-18,behavior:'smooth'});}else{t.scrollIntoView({behavior:'smooth',block:'start'});}"> <span class="psr-toc-number">08</span> <span class="psr-toc-label">Contact</span>
				<svg class="psr-toc-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true">
					<path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zm41-159c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l39-39-150.1 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l150.1 0-39-39c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l80 80c9.4 9.4 9.4 24.6 0 33.9l-80 80z" /> </svg>
			</a>
		</div>
	</nav>
	<section id="what-new" class="psr-section">
		<h2>📰 Added features</h2>
		<p> The RemasteredPS focuses on visual polish and practical improvements throughout the client. </p>
		<div class="psr-card-grid">
			<div class="psr-card">
				<h4>✨ Refreshed Visuals</h4>
				<p> Cleaner presentation and improved visual consistency across the experience. </p>
			</div>
			<div class="psr-card">
				<h4>🎨 Updated Resources</h4>
				<p> Refreshed Pokémon sprites, themes, Legend ZA Mega sprites, type icons, move buttons and more visual assets. </p>
			</div>
			<div class="psr-card">
				<h4>⚔️ Battle Improvements</h4>
				<p> Doubles, triples metagame overlapping issue fixed, Updated battle UI and backgrounds to give the battle field a more fun look. </p>
			</div>
			<div class="psr-card">
				<h4>📋 Pokepaste</h4>
				<p> Built in pokepaste to provide a more accessible format to analyze, add teams, and other useful features. </p>
			</div>
			<div class="psr-card">
				<h4>💻 MTB</h4>
				<p> A mini tool browser to view pokemon related websites at the comfort your showdown experience. </p>
			</div>
			<div class="psr-card">
				<h4>🧩 Quality Of Life</h4>
				<p> Added colors to profiles, teambuilders, color for moves, smooth animations and many more. </p>
			</div>
		</div>
	</section>
	<section id="installation" class="psr-section">
	<div class="psr-feature">
		<div class="psr-feature-content">
			<h3>🔄 Updates</h3>
			<p>Remastered is continuously improved with new features, visual updates, bug fixes, and compatibility improvements.</p>
			<ol>
				<li><strong>📩 Update Notification:</strong> You may receive a notification through Pokémon Showdown when a new Remastered update is available.</li>
				<li><strong>⬇️ Download the Update:</strong> When notified, use the provided update button to download the latest Remastered userscript and install it.</li>
				<li><strong>🌐 Manual Updates:</strong> You can also check the <a href="https://github.com/AnujSharma2008/psr" target="_blank">GitHub</a> repository or <a href="https://greasyfork.org/en/scripts/597283-pokemon-showdown-remastered/" target="_blank">Greasy Fork</a> for the latest version.</li>
				<li><strong>🔄 Stay Updated:</strong> After installing a new version, refresh Pokémon Showdown to apply the latest Remastered changes.</li>
			</ol>
		</div>
		<div class="psr-carousel">
			<div class="psr-carousel-main">
				<button class="psr-carousel-arrow psr-carousel-prev" type="button" aria-label="Previous image">
					<svg viewBox="0 0 512 512" aria-hidden="true"><path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM135 239l80-80c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-39 39 150.1 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-150.1 0 39 39c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-80-80c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>
				</button>
				<div class="psr-carousel-viewport">
					<div class="psr-carousel-track">
						<div class="psr-carousel-slide"><img src="https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/update1.png" alt="Remastered Update Step 1"></div>
						<div class="psr-carousel-slide"><img src="https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/update2.png" alt="Remastered Update Step 2"></div>
					</div>
				</div>
				<button class="psr-carousel-arrow psr-carousel-next" type="button" aria-label="Next image">
					<svg viewBox="0 0 512 512" aria-hidden="true"><path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zm41-159c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l39-39-150.1 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l150.1 0-39-39c-9.4-9.4-9.4-24.6 0-33.9s24.6-8.9 33.9 0l80 80c9.4 9.4 9.4 24.6 0 33.9l-80 80z"/></svg>
				</button>
			</div>
			<div class="psr-carousel-dots"></div>
		</div>
	</div>

	<div class="psr-feature reverse">
		<div class="psr-carousel">
			<div class="psr-carousel-main">
				<button class="psr-carousel-arrow psr-carousel-prev" type="button" aria-label="Previous image">
					<svg viewBox="0 0 512 512" aria-hidden="true"><path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM135 239l80-80c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-39 39 150.1 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-150.1 0 39 39c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-80-80c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>
				</button>
				<div class="psr-carousel-viewport">
					<div class="psr-carousel-track">
						<div class="psr-carousel-slide"><img src="https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/installation1.jpg" alt="Remastered Installation Step 1"></div>
						<div class="psr-carousel-slide"><img src="https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/installation2.jpg" alt="Remastered Installation Step 2"></div>
						<div class="psr-carousel-slide"><img src="https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/installation3.jpg" alt="Remastered Installation Step 3"></div>
						<div class="psr-carousel-slide"><img src="https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/installation4.jpg" alt="Remastered Installation Step 4"></div>
					</div>
				</div>
				<button class="psr-carousel-arrow psr-carousel-next" type="button" aria-label="Next image">
					<svg viewBox="0 0 512 512" aria-hidden="true"><path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zm41-159c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l39-39-150.1 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l150.1 0-39-39c-9.4-9.4-9.4-24.6 0-33.9s24.6-8.9 33.9 0l80 80c9.4 9.4 9.4 24.6 0 33.9l-80 80z"/></svg>
				</button>
			</div>
			<div class="psr-carousel-dots"></div>
		</div>
		<div class="psr-feature-content">
			<h3>🛠️ Installation</h3>
			<p>Follow these four simple steps to get Pokémon Showdown Remastered running on your browser.</p>
			<ol>
				<li><strong>Step 1 — Download Tampermonkey:</strong> Install <a href="https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en" target="_blank">Tampermonkey</a> from the Chrome Web Store.</li>
				<li><strong>Step 2 — Open Tampermonkey:</strong> Open your browser's extensions menu, go to <strong>Manage Extensions</strong>, and open Tampermonkey.</li>
				<li><strong>Step 3 — Enable Permissions:</strong> Turn on <strong>Allow User Scripts</strong> and enable <strong>Developer Mode</strong> if required by your browser.</li>
				<li><strong>Step 4 — Install Remastered:</strong> Open the Remastered file from <a href="https://greasyfork.org/en/scripts/597283-pokemon-showdown-remastered/" target="_blank">Greasy Fork</a> or <a href="https://github.com/AnujSharma2008/psr" target="_blank">GitHub</a>, click <strong>Install</strong>, and confirm the installation. That's it! 🎉</li>
			</ol>
			<p><strong>✨ Once installed, refresh Pokémon Showdown and Remastered will load automatically.</strong></p>
		</div>
	</div>
</section>
	<section id="features" class="psr-section">
		<h2>🌟 Features</h2>
		<p> Explore the new additions and improvements introduced in Pokémon Showdown Remastered V1, including enhanced visuals, battle features, custom themes, integrated tools, and the built-in Poképaste viewer. </p>
		<div id="psr-themes" class="psr-feature">
			<div class="psr-feature-content">
				<h3>🎭 Themes</h3>
				<p> Refreshed themes give the client a cleaner and more consistent visual appearance. </p>
				<ul>
					<li>4 new backgrounds to pick from depending on your vibes</li>
					<li>Color coded theme across the whole site for each theme</li>
					<li>Customizable themes coming soon!!</li>
				</ul>
			</div>
			<div class="psr-carousel">
				<div class="psr-carousel-main">
					<!-- PREVIOUS -->
					<button class="psr-carousel-arrow psr-carousel-prev" type="button" aria-label="Previous image">
						<svg viewBox="0 0 512 512" aria-hidden="true">
							<path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM135 239l80-80c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-39 39 150.1 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-150.1 0 39 39c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-80-80c-9.4-9.4-9.4-24.6 0-33.9z" /> </svg>
					</button>
					<!-- IMAGES -->
					<div class="psr-carousel-viewport">
						<div class="psr-carousel-track">
							<div class="psr-carousel-slide"> <img src="https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/theme1.png" alt="Remastered Theme 1"> </div>
							<div class="psr-carousel-slide"> <img src="https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/theme2.png" alt="Remastered Theme 2"> </div>
							<div class="psr-carousel-slide"> <img src="https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/theme3.png" alt="Remastered Theme 3"> </div>
							<div class="psr-carousel-slide"> <img src="https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/theme4.png" alt="Remastered Theme 4"> </div>
						</div>
					</div>
					<!-- NEXT -->
					<button class="psr-carousel-arrow psr-carousel-next" type="button" aria-label="Next image">
						<svg viewBox="0 0 512 512" aria-hidden="true">
							<path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zm41-159c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l39-39-150.1 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l150.1 0-39-39c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l80 80c9.4 9.4 9.4 24.6 0 33.9l-80 80z" /> </svg>
					</button>
				</div>
				<!-- DOTS -->
				<div class="psr-carousel-dots"></div>
			</div>
		</div>
		<div id="psr-visuals" class="psr-feature reverse">
			<div class="psr-carousel">
				<div class="psr-carousel-main">
					<button class="psr-carousel-arrow psr-carousel-prev" type="button" aria-label="Previous image">
						<svg viewBox="0 0 512 512" aria-hidden="true">
							<path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM135 239l80-80c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-39 39 150.1 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-150.1 0 39 39c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-80-80c-9.4-9.4-9.4-24.6 0-33.9z" /> </svg>
					</button>
					<div class="psr-carousel-viewport">
						<div class="psr-carousel-track">
							<div class="psr-carousel-slide"> <img src="https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/teambuilder.png" alt="Teambuilder"> </div>
							<div class="psr-carousel-slide"> <img src="https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/profiles.png" alt="profiles"> </div>
							<div class="psr-carousel-slide"> <img src="https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/homepage.png" alt="Homepage"> </div>
						</div>
					</div>
					<button class="psr-carousel-arrow psr-carousel-next" type="button" aria-label="Next image">
						<svg viewBox="0 0 512 512" aria-hidden="true">
							<path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zm41-159c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l39-39-150.1 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l150.1 0-39-39c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l80 80c9.4 9.4 9.4 24.6 0 33.9l-80 80z" /> </svg>
					</button>
				</div>
				<div class="psr-carousel-dots"></div>
			</div>
			<div class="psr-feature-content">
				<h3>✨ Visual Improvements</h3>
				<p> Small interface refinements help make different parts of the client feel more visually connected. </p>
				<ul>
					<li>Better looking profiles for each user customized with their name color</li>
					<li>Improved interface for homepage and the website as a whole</li>
					<li>Enhanced look on the default teambuilder to match the style</li>
					<li>Smoother transitions when reloading, changing rooms, opening battle teambuilders and more</li>
				</ul>
			</div>
		</div>
		<div id="psr-battle" class="psr-feature">
			<div class="psr-feature-content">
				<h3>⚔️ Battle Enhancements</h3>
				<p> Battle enhancements aim to change the aesthetics of the battlefield without changing or compromising any fundamental battle mechanics. </p>
				<ul>
					<li>Newer custom made pokemon themed HD backgrounds to elevate your battle experience.</li>
					<li>Increased contrast to give pokemon models a sharper look.</li>
					<li>Customized battle interface with better looking tooltips and buttons for moves, terastallization, mega, z moves, dynamax.</li>
					<li>Bigger battle screen to fix the issue of overlapping in doubles and triples game modes.</li>
					<li>Custom terrain images, animated weathers and animated screens for light screen reflect aurora veil and protect.</li>
				</ul>
			</div>
			<div class="psr-carousel">
				<div class="psr-carousel-main">
					<button class="psr-carousel-arrow psr-carousel-prev" type="button" aria-label="Previous image">
						<svg viewBox="0 0 512 512" aria-hidden="true">
							<path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM135 239l80-80c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-39 39 150.1 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-150.1 0 39 39c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-80-80c-9.4-9.4-9.4-24.6 0-33.9z" /> </svg>
					</button>
					<div class="psr-carousel-viewport">
						<div class="psr-carousel-track">
							<div class="psr-carousel-slide"> <img src="https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/battle.png" alt="battle"> </div>
							<div class="psr-carousel-slide"> <img src="https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/screens.png" alt="screens"> </div>
							<div class="psr-carousel-slide"> <img src="https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/metagames.png" alt="metagames"> </div>
							<div class="psr-carousel-slide"> <img src="https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/terrain.png" alt="terrain"> </div>
						</div>
					</div>
					<button class="psr-carousel-arrow psr-carousel-next" type="button" aria-label="Next image">
						<svg viewBox="0 0 512 512" aria-hidden="true">
							<path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zm41-159c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l39-39-150.1 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l150.1 0-39-39c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l80 80c9.4 9.4 9.4 24.6 0 33.9l-80 80z" /> </svg>
					</button>
				</div>
				<div class="psr-carousel-dots"></div>
			</div>
		</div>
		<div id="psr-pokepaste" class="psr-feature">
			<div class="psr-feature-content">
				<h3>📋 PokéPaste</h3>
				<p> PokéPaste resources make it easier to organize and share Pokémon teams. </p>
				<p> The guide below contains the dedicated PokéPaste instructions. </p>
			</div>
			<div class="psr-feature-image"> <img src="https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/pokepaste.jpg" alt="PokéPaste"> </div>
		</div>
		<div class="psr-howto open" id="psr-pokepaste-guide">
			<button type="button" class="psr-howto-toggle" aria-expanded="true"> <span>
            📖 How to Use PokéPaste
        </span> <span aria-hidden="true">
            ▼
        </span> </button>
			<div class="psr-howto-content">
				<div class="psr-howto-inner">
					<div class="psr-howto-body">
						<div class="psr-howto-text">
							<div class="psr-howto-slide active" data-step="1" data-image="https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/pp1.jpg">
								<div class="psr-howto-step"> <strong>
                            Step 1 of 8
                        </strong>
									<h3>
                            Loading a Poképaste:
                        </h3>
									<p> Paste a <b>Poképaste link</b> into the viewer. The Poképaste will load automatically after pasting the link, or you can simply press <b>Enter</b> to load it manually. </p>
								</div>
							</div>
							<div class="psr-howto-slide" data-step="2" data-image="https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/pp2.jpg">
								<div class="psr-howto-step"> <strong>
                            Step 2 of 8
                        </strong>
									<h3>
                            Copying an Individual Pokémon:
                        </h3>
									<p> To retrieve a specific Pokémon from the loaded team, simply <b>click on the Pokémon</b>. Its corresponding data will be copied automatically, allowing you to conveniently reuse the individual set without copying the entire team. </p>
								</div>
							</div>
							<div class="psr-howto-slide" data-step="3" data-image="https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/pp3.jpg">
								<div class="psr-howto-step"> <strong>
                            Step 3 of 8
                        </strong>
									<h3>
                            Importing a Complete Team:
                        </h3>
									<p> Select <b>Add</b> to automatically import the entire loaded Poképaste into the <b>Teambuilder</b>. This eliminates the need to manually recreate each Pokémon and its set information. </p>
								</div>
							</div>
							<div class="psr-howto-slide" data-step="4" data-image="https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/pp4.jpg">
								<div class="psr-howto-step"> <strong>
                            Step 4 of 8
                        </strong>
									<h3>
                            Copying the Team:
                        </h3>
									<p> Select <b>Copy</b> to copy the complete team in <b>Pokepaste Format</b>. This allows the team data to be conveniently transferred or reused elsewhere. </p>
								</div>
							</div>
							<div class="psr-howto-slide" data-step="5" data-image="https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/pp5.jpg">
								<div class="psr-howto-step"> <strong>
                            Step 5 of 8
                        </strong>
									<h3>
                            Sharing a Team:
                        </h3>
									<p> Select <b>Share</b> to generate and copy a <b>shareable link</b> for the loaded team. The generated link can then be provided to other players for convenient access to the same team. </p>
								</div>
							</div>
							<div class="psr-howto-slide" data-step="6" data-image="https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/pp6.jpg">
								<div class="psr-howto-step"> <strong>
                            Bonus Feature
                        </strong>
									<h3>
                            Saved Poképastes:
                        </h3>
									<p> Poképaste links opened through the viewer are automatically retained within the Poképaste area. These links remain accessible until the <b>Poképaste area</b> is manually closed, allowing you to return to previously opened teams without having to re-enter their links.
										<br>
										<br> Your saved Poképastes are also preserved when the browser is closed and reopened, ensuring that previously accessed teams are not unnecessarily lost. </p>
								</div>
							</div>
							<div class="psr-howto-slide" data-step="7" data-image="https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/pp7.jpg">
								<div class="psr-howto-step"> <strong>
                            Bonus Feature
                        </strong>
									<h3>
                            Direct Poképaste Upload:
                        </h3>
									<p> You can also <b>upload a Poképaste directly</b> to the viewer instead of manually entering its link. Once uploaded, the team opens directly inside our custom Poképaste Viewer.
										<br>
										<br> A small window of the <b>original Poképaste</b> may also appear for data retrieval purposes only. This allows the required team data to be retrieved while keeping the main experience inside the custom viewer. </p>
								</div>
							</div>
							<div class="psr-howto-slide" data-step="8" data-image="https://i.redd.it/nlhc5edcttqb1.gif">
								<div class="psr-howto-step"> <strong>
                            Bonus Feature
                        </strong>
									<h3>
                            Automatic Poképaste Opening:
                        </h3>
									<p> When <b>Pokémon Showdown is open</b>, clicking a Poképaste link will automatically route it to the client's <b>custom Poképaste Viewer</b>. This removes the need to manually open Poképaste links in a separate tab and provides a more cohesive team-building workflow. </p>
								</div>
							</div>
						</div>
						<div class="psr-howto-image"> <img src="https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/pp1.jpg" alt="PokéPaste guide - Step 1"> </div>
					</div>
					<div class="psr-howto-controls">
						<button type="button" class="psr-howto-prev" aria-label="Previous step">
							<svg class="psr-howto-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true">
								<path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zm-121-273l80-80c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-39 39 150.1 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-150.1 0 39 39c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-80-80c-9.4-9.4-9.4-24.6 0-33.9z" /> </svg> <span>Previous</span> </button> <span class="psr-howto-counter">
                Step 1 of 8
            </span>
						<button type="button" class="psr-howto-next" aria-label="Next step"> <span>Next</span>
							<svg class="psr-howto-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true">
								<path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zm41-159c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l39-39-150.1 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l150.1 0-39-39c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l80 80c9.4 9.4 9.4 24.6 0 33.9l-80 80z" /> </svg>
						</button>
					</div>
					<div class="psr-howto-dots"> <span class="active"></span> <span></span> <span></span> <span></span> <span></span> <span></span> <span></span> <span></span> </div>
				</div>
			</div>
		</div>
	</section>
	<section id="psr-quality-of-life" class="psr-section">
		<div class="psr-feature reverse">
			<div class="psr-feature-image"> <img src="https://i.redd.it/69e1d87us6ha1.gif" alt="Quality of Life" style="object-fit: cover;"> </div>
			<div class="psr-feature-content">
				<h3>🧩 Quality of Life</h3>
				<p> Small improvements that make everyday interaction with the client more convenient. </p>
				<ul>
					<li>Cleaner interface elements</li>
					<li>Improved navigation</li>
					<li>Better visual feedback</li>
					<li>More consistent components</li>
				</ul>
			</div>
		</div>
	</section>
	<section id="patch-logs" class="psr-section">
		<h2>📰 Patch Logs / What's Next</h2>
		<p> Remastered is continuously refined with bug fixes, visual improvements, compatibility updates, and new quality-of-life features. </p>
		<div class="psr-bulletin">
			<!-- =========================================
             CURRENT
             ========================================= -->
			<div class="psr-bulletin-column">
				<div class="psr-bulletin-header current"> <span class="psr-bulletin-icon" aria-hidden="true">⚙️</span>
					<div>
						<h3>Current</h3> <span class="psr-bulletin-status">
                        Fixed & Improved
                    </span> </div>
				</div>
				<ul class="psr-bulletin-list">
					<li> <span class="psr-bulletin-mark" aria-hidden="true"></span>
						<div> <strong>Screen scrolling bug fixed</strong>
							<p> Fixed issues where scrolling could behave incorrectly inside different client sections. </p>
						</div>
					</li>
					<li> <span class="psr-bulletin-mark" aria-hidden="true"></span>
						<div> <strong>Trainer visibility fixed</strong>
							<p> Improved trainer display when battles contain multiple Pokémon. </p>
						</div>
					</li>
					<li> <span class="psr-bulletin-mark" aria-hidden="true"></span>
						<div> <strong>PokéPaste images fixed</strong>
							<p> Resolved an issue where PokéPaste Pokémon images could fail to appear correctly. </p>
						</div>
					</li>
					<li> <span class="psr-bulletin-mark" aria-hidden="true"></span>
						<div> <strong>Broken image fallback added</strong>
							<p> Broken images are now replaced with the Ghost sprite instead of empty image areas. </p>
						</div>
					</li>
					<li> <span class="psr-bulletin-mark" aria-hidden="true"></span>
						<div> <strong>Old battle backgrounds replaced</strong>
							<p> Refreshed older backgrounds with newer custom battle visuals. </p>
						</div>
					</li>
					<li> <span class="psr-bulletin-mark" aria-hidden="true"></span>
						<div> <strong>Image loading issues fixed</strong>
							<p> Improved image handling to reduce failed and inconsistent resource loading. </p>
						</div>
					</li>
					<li> <span class="psr-bulletin-mark" aria-hidden="true"></span>
						<div> <strong>UI & resource fixes</strong>
							<p> Multiple smaller visual, resource, and interface issues have also been addressed. </p>
						</div>
					</li>
					<li> <span class="psr-bulletin-mark" aria-hidden="true"></span>
						<div> <strong>Pokémon resource improvements</strong>
							<p> Improved handling of custom sprites and other Remastered visual resources. </p>
						</div>
					</li>
				</ul>
			</div>
			<!-- =========================================
             WHAT'S NEXT
             ========================================= -->
			<div class="psr-bulletin-column">
				<div class="psr-bulletin-header upcoming"> <span class="psr-bulletin-icon" aria-hidden="true">🚀</span>
					<div>
						<h3>What's Next</h3> <span class="psr-bulletin-status">
                        Upcoming
                    </span> </div>
				</div>
				<ul class="psr-bulletin-list">
					<li> <span class="psr-bulletin-mark" aria-hidden="true"></span>
						<div> <strong>New Pokémon Showdown client compatibility</strong>
							<p> Updating Remastered to work smoothly with the new Pokémon Showdown client launched on September 22, 2026. </p>
						</div>
					</li>
					<li> <span class="psr-bulletin-mark" aria-hidden="true"></span>
						<div> <strong>Better MTB functionality</strong>
							<p> More useful tools, improved navigation, and additional Mini Tool Browser functionality. </p>
						</div>
					</li>
					<li> <span class="psr-bulletin-mark" aria-hidden="true"></span>
						<div> <strong>Private message chat bubbles</strong>
							<p> A cleaner chat-bubble style presentation for private messages. </p>
						</div>
					</li>
					<li> <span class="psr-bulletin-mark" aria-hidden="true"></span>
						<div> <strong>Better client integration</strong>
							<p> Continued work to make Remastered features integrate smoothly with newer client updates. </p>
						</div>
					</li>
					<li> <span class="psr-bulletin-mark" aria-hidden="true"></span>
						<div> <strong>More themes & visual resources</strong>
							<p> Additional themes, backgrounds, animations, and refreshed visual assets. </p>
						</div>
					</li>
					<li> <span class="psr-bulletin-mark" aria-hidden="true"></span>
						<div> <strong>More quality-of-life features</strong>
							<p> New small improvements designed to make everyday client usage smoother. </p>
						</div>
					</li>
					<li> <span class="psr-bulletin-mark" aria-hidden="true"></span>
						<div> <strong>More battle improvements</strong>
							<p> Continued improvements to battle visuals, interface elements, and overall presentation. </p>
						</div>
					</li>
					<li> <span class="psr-bulletin-mark" aria-hidden="true"></span>
						<div> <strong>And much more...</strong>
							<p> Remastered will continue evolving alongside Pokémon Showdown with new features and improvements. </p>
						</div>
					</li>
				</ul>
			</div>
		</div>
	</section>
	<section id="feedback" class="psr-section">
		<div class="psr-feedback">
			<h3>💬 Feedback & Suggestions</h3>
			<p> Found something that could be improved? Share your feedback or suggest an idea for a future update. </p>
			<form id="psr-feedback-form">
				<label for="psr-feedback-username"> PS Account Name </label>
				<input type="text" id="psr-feedback-username" name="username" placeholder="Login to fill form" readonly disabled required>
				<label for="psr-feedback-type"> Feedback Type </label>
				<select id="psr-feedback-type" name="feedback-type" required disabled>
					<option value="" selected disabled> Choose </option>
					<option value="Feedback"> 💙 Feedback </option>
					<option value="Bug Report"> 🐛 Bug Report </option>
					<option value="Suggestion"> 💡 Suggestion </option>
					<option value="Other"> 📌 Other </option>
				</select>
				<label for="psr-feedback-message"> Message </label>
				<textarea id="psr-feedback-message" name="message" placeholder="Tell us what you think..." required disabled></textarea>
				<button class="psr-footer-contact" type="submit" disabled> 💙 Send Message </button>
				<p id="psr-feedback-status" style="display:none;"></p>
			</form>
		</div>
	</section>
	<section id="credits" class="psr-credits">
		<h3>👥 Credits</h3>
		<p class="psr-credits-intro"> Pokémon Showdown Remastered is made possible by the developers, designers, contributors, testers, and community members who help shape the project. </p>
		<!-- CREDITS -->
		<div class="psr-credits-grid">
			<div class="psr-credit-person"> <span class="psr-credit-name" style="color:#E22B74">
                Nikizzz_Chan
            </span> <span class="psr-credit-role">
                Lead Developer
            </span> </div>
			<div class="psr-credit-person"> <span class="psr-credit-name" style="color:#578D35">
                Altacc808
            </span> <span class="psr-credit-role">
                Testing & QA
            </span> </div>
		</div>
		<!-- RESOURCES -->
		<div class="psr-resources">
			<div class="psr-resources-title"> <span>✦</span> <strong>Resources & Inspiration</strong> </div>
			<div class="psr-resources-grid">
				<!-- Alpha Coders -->
				<a class="psr-resource" href="https://alphacoders.com/" target="_blank" rel="noopener noreferrer"> <span class="psr-resource-name">
                Alpha Coders
            </span> <span class="psr-resource-type">
                Wallpapers & Theme Backgrounds
            </span> </a>
				<!-- Reddit -->
				<a class="psr-resource" href="https://www.reddit.com/" target="_blank" rel="noopener noreferrer"> <span class="psr-resource-name">
                Reddit
            </span> <span class="psr-resource-type">
                GIFs & Other Resources
            </span> </a>
				<!-- Bulbapedia -->
				<a class="psr-resource" href="https://bulbapedia.bulbagarden.net/" target="_blank" rel="noopener noreferrer"> <span class="psr-resource-name">
                Bulbapedia
            </span> <span class="psr-resource-type">
                Type Icons and More
            </span> </a>
				<!-- PokémonDB -->
				<a class="psr-resource" href="https://pokemondb.net/pokedex" target="_blank" rel="noopener noreferrer"> <span class="psr-resource-name">
                PokémonDB
            </span> <span class="psr-resource-type">
                Pokémon Sprites and More
            </span> </a>
				<!-- DeviantArt -->
				<a class="psr-resource" href="https://www.deviantart.com/retronc/gallery/98179468/in-gen-5-style" target="_blank" rel="noopener noreferrer"> <span class="psr-resource-name">
                DeviantArt — Retr0NC
            </span> <span class="psr-resource-type">
                Gen 5 Style Sprites
            </span> </a>
				<!-- UserStyles.World -->
				<a class="psr-resource" href="https://userstyles.world/" target="_blank" rel="noopener noreferrer"> <span class="psr-resource-name">
                UserStyles.World
            </span> <span class="psr-resource-type">
                Reference from Other Skins
            </span> </a>
			</div>
		</div>
		<div class="psr-community-thanks">
			<div class="psr-community-title"> <span>♥</span> <strong>Thanks to the Community</strong> </div>
			<p class="psr-community-intro"> Special thanks to the supporters, bug hunters, testers, contributors, and community members who help improve Pokémon Showdown Remastered. </p>
			<div class="psr-community-grid">
				<div class="psr-community-person"> <span style="color:#CE1C4E;" class="psr-community-name">
                    Scald Spamm
                </span> <span class="psr-community-role">
                    Supporter
                </span> </div>
				<div class="psr-community-person"> <span style="color:#919C1A;" class="psr-community-name">
                    Vinz00640
                </span> <span class="psr-community-role">
                    Supporter & Bug Hunter
                </span> </div>
				<div class="psr-community-person"> <span style="color: #B85181;" class="psr-community-name">
                    Tedu4
                </span> <span class="psr-community-role">
                    Supporter
                </span> </div>
			</div>
			<div class="psr-community-footer"> <span>✦</span> And everyone else who continues to support the project. </div>
		</div>
	</section>
	<footer id="contact" class="psr-footer">
    <p class="psr-footer-title">💙 Pokémon Showdown Remastered</p>

    <p class="psr-footer-description">
        ✨ A community-made project built with love for the Pokémon Showdown community.
    </p>

    <p class="psr-footer-message">
        🛠️ Non-profit project • 🚀 More improvements coming • 💫 Keep supporting us for future updates!
    </p>

    <!-- NEW: Contact Info -->
    <div class="psr-footer-info">
        <div class="psr-footer-info-row">
            <span>💬</span>
            <span>Discord</span>
            <strong>remastered_ps</strong>
        </div>

        <div class="psr-footer-info-divider"></div>

        <div class="psr-footer-info-row">
            <span>🎮</span>
            <span>Pokémon Showdown</span>
            <strong>Nikizzz_Chan</strong>
        </div>

        <div class="psr-footer-info-row">
            <span>🎮</span>
            <span>Pokémon Showdown</span>
            <strong>Altacc808</strong>
        </div>
    </div>
    <br>
    <a href="https://discord.com/users/1551680556474040343" class="psr-footer-contact" target="_blank" rel="noopener noreferrer">
        📩 Contact Us
    </a>
    <p class="psr-footer-ending">
        <span>❤️ Made with love</span>
        <span>🎨 Built for the community</span>
        <span>🌟 More to come</span>
    </p>
</footer>
</div>
`;

    (function() {

        function initPSRCarousels() {

            document.querySelectorAll(".psr-carousel").forEach(function(carousel) {

                if (carousel.dataset.initialized === "true") {
                    return;
                }

                const slides = carousel.querySelectorAll(
                    ".psr-carousel-slide"
                );

                const dotsContainer = carousel.querySelector(
                    ".psr-carousel-dots"
                );

                const prevButton = carousel.querySelector(
                    ".psr-carousel-prev"
                );

                const nextButton = carousel.querySelector(
                    ".psr-carousel-next"
                );

                if (!slides.length || !dotsContainer) {
                    return;
                }

                carousel.dataset.initialized = "true";

                let currentSlide = 0;
                let timer = null;


                /* CREATE DOTS */

                slides.forEach(function(_, index) {

                    const dot = document.createElement("button");

                    dot.type = "button";
                    dot.className = "psr-carousel-dot";

                    dot.setAttribute(
                        "aria-label",
                        "Go to image " + (index + 1)
                    );

                    dot.addEventListener("click", function() {

                        showSlide(index);
                        restartTimer();

                    });

                    dotsContainer.appendChild(dot);

                });


                function getDots() {

                    return carousel.querySelectorAll(
                        ".psr-carousel-dot"
                    );

                }


                function showSlide(index) {

                    currentSlide =
                        (index + slides.length) %
                        slides.length;


                    slides.forEach(function(slide, i) {

                        slide.classList.toggle(
                            "active",
                            i === currentSlide
                        );

                    });


                    getDots().forEach(function(dot, i) {

                        dot.classList.toggle(
                            "active",
                            i === currentSlide
                        );

                    });

                }


                function nextSlide() {

                    showSlide(currentSlide + 1);

                    restartTimer();

                }


                function previousSlide() {

                    showSlide(currentSlide - 1);

                    restartTimer();

                }


                function restartTimer() {

                    clearInterval(timer);

                    timer = setInterval(
                        nextSlide,
                        3000
                    );

                }


                if (nextButton) {

                    nextButton.addEventListener(
                        "click",
                        nextSlide
                    );

                }


                if (prevButton) {

                    prevButton.addEventListener(
                        "click",
                        previousSlide
                    );

                }


                showSlide(0);

                restartTimer();

            });

        }


        /* INITIAL LOAD */

        initPSRCarousels();


        /* HANDLE ROOM/RESOURCES RECREATION */

        const observer = new MutationObserver(function() {

            initPSRCarousels();

        });


        observer.observe(
            document.body, {
                childList: true,
                subtree: true
            }
        );

    })();

    function setupScrollAnimations(root) {

        if (!root) return;

        root.classList.add("psr-animate");

        const sections = root.querySelectorAll(".psr-section");

        sections.forEach(function(section, index) {
            section.classList.add(index % 2 === 0 ? "psr-reveal" : "psr-reveal-right");
        });

        root.querySelectorAll(".psr-feature").forEach(function(feature) {
            feature.classList.add("psr-reveal");
        });

        root.querySelectorAll(".psr-feedback, .psr-credits, .psr-footer").forEach(function(element) {
            element.classList.add("psr-reveal");
        });

        root.querySelectorAll(".psr-card-grid").forEach(function(grid) {
            grid.classList.add("psr-stagger");
        });

        root.querySelectorAll(".psr-howto").forEach(function(guide) {
            guide.classList.add("psr-reveal");
        });

        const animated = root.querySelectorAll(".psr-reveal, .psr-reveal-left, .psr-reveal-right, .psr-stagger");

        if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            animated.forEach(function(element) {
                element.classList.add("psr-in-view");
            });
            return;
        }

        if (!("IntersectionObserver" in window)) {
            animated.forEach(function(element) {
                element.classList.add("psr-in-view");
            });
            return;
        }

        let scrollRoot = null;
        let current = root.parentElement;

        while (current && current !== document.body) {
            const style = window.getComputedStyle(current);
            const canScroll = (style.overflowY === "auto" || style.overflowY === "scroll" || style.overflowY === "overlay") && current.scrollHeight > current.clientHeight + 4;
            if (canScroll) {
                scrollRoot = current;
                break;
            }
            current = current.parentElement;
        }

        const animationObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting || entry.intersectionRatio > 0) {
                    entry.target.classList.add("psr-in-view");
                    animationObserver.unobserve(entry.target);
                }
            });
        }, {
            root: scrollRoot,
            threshold: 0.05,
            rootMargin: "0px 0px -8% 0px"
        });

        animated.forEach(function(element) {
            animationObserver.observe(element);
        });

        setTimeout(function() {
            animated.forEach(function(element) {
                const rect = element.getBoundingClientRect();
                if (rect.top < window.innerHeight + 120 && rect.bottom > -120) {
                    element.classList.add("psr-in-view");
                    animationObserver.unobserve(element);
                }
            });
        }, 100);
    }

    function initPokepasteGuide(root) {

        const guide =
            root.querySelector("#psr-pokepaste-guide");

        if (!guide) return;

        if (
            guide.dataset.initialized === "true"
        ) {
            return;
        }

        const toggle =
            guide.querySelector(".psr-howto-toggle");

        const content =
            guide.querySelector(".psr-howto-content");

        const slides =
            guide.querySelectorAll(".psr-howto-slide");

        const previous =
            guide.querySelector(".psr-howto-prev");

        const next =
            guide.querySelector(".psr-howto-next");

        const counter =
            guide.querySelector(".psr-howto-counter");

        const dots =
            guide.querySelectorAll(".psr-howto-dots span");

        const image =
            guide.querySelector(".psr-howto-image img");


        if (
            !toggle ||
            !content ||
            !slides.length ||
            !previous ||
            !next ||
            !counter ||
            !image
        ) {
            return;
        }


        guide.dataset.initialized = "true";

        guide.classList.add("open");

        toggle.setAttribute(
            "aria-expanded",
            "true"
        );

        content.style.display = "block";


        let currentStep = 0;


        function showStep(index) {

            if (index < 0) {
                index = 0;
            }

            if (index >= slides.length) {
                index = slides.length - 1;
            }


            currentStep = index;


            slides.forEach(
                function(slide, slideIndex) {

                    slide.classList.toggle(
                        "active",
                        slideIndex === currentStep
                    );

                }
            );


            dots.forEach(
                function(dot, dotIndex) {

                    dot.classList.toggle(
                        "active",
                        dotIndex === currentStep
                    );

                }
            );


            const currentSlide =
                slides[currentStep];

            const newImage =
                currentSlide.dataset.image;


            if (newImage) {

                image.style.opacity = "0";

                setTimeout(
                    function() {

                        image.src = newImage;

                        image.style.opacity = "1";

                    },
                    120
                );

            }


            image.alt =
                "PokéPaste guide - Step " +
                (currentStep + 1);


            counter.textContent =
                "Step " +
                (currentStep + 1) +
                " of " +
                slides.length;


            previous.disabled =
                currentStep === 0;

            next.disabled =
                currentStep === slides.length - 1;

        }

        toggle.addEventListener(
            "click",
            function(event) {

                event.preventDefault();
                event.stopPropagation();


                const isOpen =
                    guide.classList.contains("open");


                if (isOpen) {

                    guide.classList.remove("open");

                    toggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    content.style.display = "none";

                } else {

                    guide.classList.add("open");

                    toggle.setAttribute(
                        "aria-expanded",
                        "true"
                    );

                    content.style.display = "block";

                }

            }
        );

        previous.addEventListener(
            "click",
            function(event) {

                event.preventDefault();
                event.stopPropagation();

                showStep(
                    currentStep - 1
                );

            }
        );

        next.addEventListener(
            "click",
            function(event) {

                event.preventDefault();
                event.stopPropagation();

                showStep(
                    currentStep + 1
                );

            }
        );

        dots.forEach(
            function(dot, index) {

                dot.addEventListener(
                    "click",
                    function(event) {

                        event.preventDefault();
                        event.stopPropagation();

                        showStep(index);

                    }
                );

            }
        );


        showStep(0);

    }


    function initFeedbackForm(root) {

        const form = root.querySelector("#psr-feedback-form");
        if (!form || form.dataset.initialized === "true") return;

        const usernameInput = form.querySelector("#psr-feedback-username");
        const typeInput = form.querySelector("#psr-feedback-type");
        const messageInput = form.querySelector("#psr-feedback-message");
        const submitButton = form.querySelector("button[type=\"submit\"]");
        const status = form.querySelector("#psr-feedback-status");

        if (!usernameInput || !typeInput || !messageInput || !submitButton) return;

        form.dataset.initialized = "true";

        function getUserObject() {
            try {
                if (typeof app !== "undefined" && app && app.user) return app.user;
            } catch (error) {}
            try {
                if (window.app && window.app.user) return window.app.user;
            } catch (error) {}
            try {
                if (typeof PS !== "undefined" && PS && PS.user) return PS.user;
            } catch (error) {}
            return null;
        }

        function getUserValue(user, key) {
            try {
                if (user && typeof user.get === "function") {
                    return String(user.get(key) || "").trim();
                }
            } catch (error) {}
            return "";
        }

        function isGuestIdentity(value) {
            return /^guest\d*$/i.test(String(value || "").trim());
        }

        function getPSIdentity() {
            const user = getUserObject();
            if (!user) return "";

            const userid = getUserValue(user, "userid");
            const name = getUserValue(user, "name");

            if (userid && isGuestIdentity(userid)) return "";
            if (name && isGuestIdentity(name)) return "";

            return name || userid;
        }

        function setLocked() {
            usernameInput.value = "";
            usernameInput.placeholder = "Login to fill form";
            usernameInput.disabled = true;
            typeInput.disabled = true;
            messageInput.disabled = true;
            submitButton.disabled = true;
            form.classList.add("psr-feedback-locked");
        }

        function setReady(identity) {
            usernameInput.disabled = false;
            usernameInput.readOnly = true;
            usernameInput.value = identity;
            usernameInput.placeholder = "";
            typeInput.disabled = false;
            messageInput.disabled = false;
            submitButton.disabled = false;
            form.classList.remove("psr-feedback-locked");
        }

        function updateState() {
            const identity = getPSIdentity();
            if (!identity) {
                setLocked();
                return;
            }
            setReady(identity);
        }

        function addCelebrationStyles() {
            if (document.getElementById("psr-feedback-celebration-style")) return;

            const style = document.createElement("style");
            style.id = "psr-feedback-celebration-style";
            style.textContent = `
                .psr-feedback-success {
                    position: relative;
                    min-height: 330px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    overflow: hidden;
                    border-radius: 16px;
                    animation: psrFeedbackSuccessIn .55s cubic-bezier(.2,.8,.2,1) both;
                }
                .psr-feedback-success img {
                    width: min(260px, 78%);
                    max-height: 220px;
                    object-fit: contain;
                    border-radius: 14px;
                    animation: psrFeedbackGifIn .7s cubic-bezier(.2,1.4,.4,1) both;
                }
                .psr-feedback-success h3 {
                    margin: 18px 0 6px;
                    font-size: 24px;
                    font-weight: 900;
                }
                .psr-feedback-success p {
                    margin: 0;
                    opacity: .78;
                }
                .psr-feedback-confetti {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    overflow: hidden;
                }
                .psr-feedback-confetti span {
                    position: absolute;
                    top: -24px;
                    width: 8px;
                    height: 14px;
                    border-radius: 2px;
                    background: hsl(var(--h), 85%, 65%);
                    animation: psrFeedbackConfetti 2.7s cubic-bezier(.15,.75,.25,1) forwards;
                    animation-delay: var(--d);
                    transform: rotate(var(--r));
                }
                @keyframes psrFeedbackSuccessIn {
                    from { opacity: 0; transform: translateY(18px) scale(.96); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes psrFeedbackGifIn {
                    0% { opacity: 0; transform: scale(.72) rotate(-3deg); }
                    70% { opacity: 1; transform: scale(1.05) rotate(1deg); }
                    100% { opacity: 1; transform: scale(1) rotate(0); }
                }
                @keyframes psrFeedbackConfetti {
                    0% { top: -24px; opacity: 0; transform: translate3d(0,0,0) rotate(0); }
                    10% { opacity: 1; }
                    100% { top: 110%; opacity: 0; transform: translate3d(var(--x), 0, 0) rotate(720deg); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .psr-feedback-success, .psr-feedback-success img, .psr-feedback-confetti span {
                        animation: none !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        function showSuccess() {
            clearInterval(stateTimer);
            stateWatcher.disconnect();
            addCelebrationStyles();

            const success = document.createElement("div");
            success.className = "psr-feedback-success";

            const confetti = document.createElement("div");
            confetti.className = "psr-feedback-confetti";

            for (let i = 0; i < 42; i++) {
                const piece = document.createElement("span");
                piece.style.left = (Math.random() * 100) + "%";
                piece.style.setProperty("--x", ((Math.random() - .5) * 180) + "px");
                piece.style.setProperty("--d", (Math.random() * .9) + "s");
                piece.style.setProperty("--r", (Math.random() * 360) + "deg");
                piece.style.setProperty("--h", String(Math.floor(Math.random() * 360)));
                confetti.appendChild(piece);
            }

            const image = document.createElement("img");
            image.src = "https://media.tenor.com/LivvSB-LadgAAAAj/pokemon-thankyou.gif";
            image.alt = "Thank you";

            const text = document.createElement("p");
            text.textContent = "Your feedback has been submitted successfully.";

            success.appendChild(confetti);
            success.appendChild(image);
            success.appendChild(text);

            form.replaceWith(success);
        }

        updateState();

        const stateWatcher = new MutationObserver(function() {
            if (document.contains(form)) updateState();
        });

        stateWatcher.observe(document.body, {
            childList: true,
            subtree: true
        });

        const stateTimer = setInterval(function() {
            if (document.contains(form)) {
                updateState();
            } else {
                clearInterval(stateTimer);
                stateWatcher.disconnect();
            }
        }, 1000);

        form.addEventListener("submit", function(event) {
            event.preventDefault();
            event.stopPropagation();

            const identity = getPSIdentity();

            if (!identity) {
                setLocked();
                return;
            }

            if (!typeInput.value || !messageInput.value.trim()) {
                form.reportValidity();
                return;
            }

            submitButton.disabled = true;

            const iframe = document.createElement("iframe");
            iframe.name = "psr-feedback-submit-" + Date.now();
            iframe.style.display = "none";
            document.body.appendChild(iframe);

            const googleForm = document.createElement("form");
            googleForm.method = "POST";
            googleForm.action = "https://docs.google.com/forms/d/e/1FAIpQLScX6J0LQi4OUBUKIlVXW-pyfQRPHT0CB8xXGwvJUFR7g9OIqA/formResponse";
            googleForm.target = iframe.name;
            googleForm.style.display = "none";

            function addField(name, value) {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = name;
                input.value = value;
                googleForm.appendChild(input);
            }

            addField("entry.737700232", identity);
            addField("entry.802771460", typeInput.value);
            addField("entry.182263068", messageInput.value.trim());

            document.body.appendChild(googleForm);
            googleForm.submit();

            if (status) status.style.display = "none";

            setTimeout(function() {
                if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
                if (googleForm.parentNode) googleForm.parentNode.removeChild(googleForm);
                showSuccess();
            }, 900);
        });
    }
function updateRoomResources() {

    const resources =
        document.querySelector(
            "#room-resources"
        );

    if (!resources) return;


    // Change title only for the Resources room
    if (
        resources.style.display !== "none" &&
        resources.offsetParent !== null
    ) {
        document.title =
            "User Manual - Showdown!";
    }


    const pad =
        resources.querySelector(
            ".pad"
        );

    if (!pad) return;


    if (
        pad.dataset.customResources ===
        "true"
    ) {
        return;
    }


    pad.innerHTML =
        customHTML;

    pad.dataset.customResources =
        "true";


    const root =
        pad.querySelector(
            ".psr-guide"
        );

    if (!root) return;


    setupScrollAnimations(
        root
    );

    initPokepasteGuide(
        root
    );

    initFeedbackForm(
        root
    );

}


let resourcesUpdateQueued = false;


function queueRoomResourcesUpdate() {

    if (resourcesUpdateQueued) return;

    resourcesUpdateQueued = true;

    requestAnimationFrame(
        function() {

            resourcesUpdateQueued =
                false;

            updateRoomResources();

        }
    );

}


updateRoomResources();


const observer =
    new MutationObserver(
        function() {

            queueRoomResourcesUpdate();

        }
    );


observer.observe(
    document.body,
    {
        childList: true,
        subtree: true
    }
);


})();

(function () {
    "use strict";

    const STORAGE_KEY = "psr_remastered_initialized";

    if (
        localStorage.getItem(STORAGE_KEY) === "true" ||
        document.querySelector(".psr-welcome-overlay")
    ) {
        return;
    }

    function applyRemasteredSettings() {
        let prefs = {};

        try {
            prefs = JSON.parse(
                localStorage.getItem("showdown_prefs") || "{}"
            );
        } catch (e) {
            prefs = {};
        }

        prefs.theme = "dark";
        prefs.onepanel = true;

        localStorage.setItem(
            "showdown_prefs",
            JSON.stringify(prefs)
        );

        document.documentElement.classList.add("dark");

        const client = window.app;

        if (
            client &&
            typeof client.updateLayout === "function"
        ) {
            client.singlePanelMode = true;

            if (client.curRoom) {
                client.updateLayout();
            }
        }
    }

    function applyRemasteredBackground() {
        const client = window.app;

        const options =
            document.querySelector(
                '[aria-label="Options"]'
            ) ||
            document.querySelector(
                '[title="Options"]'
            );

        if (!options) return;

        options.click();

        setTimeout(function () {
            const background =
                document.querySelector(
                    'button[name="background"]'
                );

            if (!background) return;

            background.click();

            setTimeout(function () {
                const charizards =
                    document.querySelector(
                        'button[name="setBg"][value="charizards"]'
                    );

                if (!charizards) return;

                charizards.click();

                setTimeout(function () {
                    if (
                        client &&
                        typeof client.closePopup ===
                            "function"
                    ) {
                        client.closePopup();

                        setTimeout(function () {
                            client.closePopup();
                        }, 100);
                    }
                }, 100);

            }, 100);

        }, 100);
    }

    const popupHTML = `
<div class="psr-welcome-overlay">

    <div class="psr-welcome-popup">

        <div class="psr-welcome-scroll">

            <div class="psr-welcome-logo">
                <img
                    src="https://play.pokemonshowdown.com/pokemonshowdownbeta.png"
                    srcset="https://play.pokemonshowdown.com/pokemonshowdownbeta@2x.png 2x"
                    alt="Pokémon Showdown! (beta)"
                    width="146"
                    height="44"
                >
            </div>

            <div class="psr-welcome-hero">

                <div class="psr-welcome-tag">
                    ✨ Remastered PS
                </div>

                <h2 style="font-size: 20pt;">
                    Pokémon Showdown Remastered
                </h2>

            </div>

            <div class="psr-welcome-warning">

                <div class="psr-warning-divider">

                    <span class="psr-warning-line"></span>

                    <span class="psr-warning-circle">
                        <span class="psr-warning-triangle"></span>
                    </span>

                    <span class="psr-warning-line"></span>

                </div>

                <h3>
                    Important Notice
                </h3>

                <p class="psr-warning-intro">
                    Please read the following before continuing.
                </p>

                <div class="psr-warning-items">

                    <div class="psr-warning-item">
                        <strong>Dark Mode</strong>
                        <span>
                            Remastered PS is designed specifically
                            for Dark Mode. Light Mode may cause
                            visual and functional issues.
                        </span>
                    </div>

                    <div class="psr-warning-item">
                        <strong>Single Panel Mode</strong>
                        <span>
                            Single Panel Mode is required for the
                            client to function correctly.
                        </span>
                    </div>

                    <div class="psr-warning-item">
                        <strong>Panels & Layout</strong>
                        <span>
                            Using left and right panels may interfere
                            with custom features and cause unexpected
                            issues.
                        </span>
                    </div>

                    <div class="psr-warning-item">
                        <strong>Client Compatibility</strong>
                        <span>
                            The new Pokémon Showdown client released
                            on 22nd September 2026 has been disabled
                            within Remastered V1 because certain
                            aspects interfere with the custom features
                            and modifications included in this client.
                        </span>
                    </div>

                    <div class="psr-warning-item">
                        <strong>Other Plugins</strong>
                        <span>
                            We recommend not pairing this client with
                            other plugins as they may interfere with
                            its functionality. Use them at your own
                            discretion.
                        </span>
                    </div>

                </div>

            </div>

            <div class="psr-welcome-section">

                <h3>
                    WELCOME & THANK YOU
                </h3>

                <p>
                    Thank you for downloading and trying
                    Pokémon Showdown Remastered V1.
                </p>

                <p>
                    We’ve put considerable time and effort into
                    refining the client and its features.
                </p>

                <p>
                    To ensure a smooth experience, we recommend
                    going through the User Manual below.
                </p>

            </div>

            <div class="psr-welcome-section">

                <h3>
                    Stay Updated
                </h3>

                <p>
                    Be on the lookout for our
                    <strong>custom news box</strong> for the latest
                    updates, patches, and important announcements
                    related to Remastered V1.
                </p>

            </div>

            <div class="psr-welcome-section">

                <h3>
                    Privacy Policy
                </h3>

                <p>
                    This project is open-source, and we do not
                    collect or store personal information through
                    the client.
                </p>

                <p>
                    The only information requested is your Pokémon
                    Showdown username when submitting feedback.
                </p>

            </div>

            <div class="psr-welcome-section">

                <h3>
                    Disclaimer & Affiliation
                </h3>

                <p>
                    Pokémon Showdown Remastered V1 is an independent
                    community project created for entertainment
                    and personal use.
                </p>

                <p>
                    This project is not affiliated with, endorsed by,
                    sponsored by, or officially associated with
                    Pokémon Showdown, Game Freak, or Nintendo.
                </p>

            </div>

            <div class="psr-welcome-consent">

                <label class="psr-welcome-check">

                    <input
                        type="checkbox"
                        class="psr-welcome-checkbox"
                    >

                    <span class="psr-welcome-checkmark"></span>

                    <span class="psr-welcome-check-text">
                        I have read and understood everything above
                    </span>

                </label>

            </div>

            <a
                href="/resources"
                class="psr-footer-contact psr-welcome-start"
                aria-disabled="true"
            >

                <span class="psr-welcome-start-text">
                    Let's Go
                </span>

                <svg
                    class="psr-welcome-start-icon"
                    viewBox="0 0 448 512"
                    aria-hidden="true"
                    focusable="false"
                >
                    <path
                        d="M384 32c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96C0 60.7 28.7 32 64 32l320 0zM168 160c-9.7 0-18.5 5.8-22.2 14.8s-1.7 19.3 5.2 26.2l35 35-67 67c-9.4 9.4-9.4 24.6 0 33.9l24 24c9.4 9.4 24.6 9.4 33.9 0l67-67 35 35c6.9 6.9 17.2 8.9 26.2 5.2S320 321.7 320 312l0-128c0-13.3-10.7-24-24-24l-128 0z"
                    />
                </svg>

            </a>

        </div>

    </div>

</div>`;
if (
    window.location.hostname === "pokepast.es" ||
    window.location.hostname === "www.pokepast.es"
) {
    overlay.style.setProperty(
        "display",
        "none",
        "important"
    );
}
    document.body.insertAdjacentHTML(
        "beforeend",
        popupHTML
    );

    const overlay =
        document.querySelector(
            ".psr-welcome-overlay"
        );

    const checkbox =
        overlay.querySelector(
            ".psr-welcome-checkbox"
        );

    const button =
        overlay.querySelector(
            ".psr-welcome-start"
        );

    checkbox.addEventListener(
        "change",
        function () {
            const enabled =
                checkbox.checked;

            button.classList.toggle(
                "psr-welcome-ready",
                enabled
            );

            button.setAttribute(
                "aria-disabled",
                enabled
                    ? "false"
                    : "true"
            );
        }
    );

    button.addEventListener(
        "click",
        function (event) {

            if (!checkbox.checked) {
                event.preventDefault();
                return;
            }

            event.preventDefault();

            localStorage.setItem(
                STORAGE_KEY,
                "true"
            );

            applyRemasteredSettings();
            applyRemasteredBackground();

            setTimeout(function () {
                window.location.reload();
            }, 700);
        }
    );

    button.classList.remove(
        "psr-welcome-ready"
    );

    button.setAttribute(
        "aria-disabled",
        "true"
    );

})();
(function() {
    'use strict';
    const myCss = `

@font-face {
  font-family: 'Lexend';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/lexend/v19/wlpwgwvFAVdoq2_v-6QU.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
body {
    overflow-x: hidden;
}
body[style*="charizards"] {
    --red: 185 142 214;
}
body[style*="horizon"] {
    --green: 110 183 129;
}
body[style*="ocean"] {
    --blue: 41 159 180;
}
body[style*="shaymin"] {
    --yellow: 218 168 69;
}
:root {
    --icon-copy: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 640'%3E%3Cpath d='M288 64C252.7 64 224 92.7 224 128L224 384C224 419.3 252.7 448 288 448L480 448C515.3 448 544 419.3 544 384L544 183.4C544 166 536.9 149.3 524.3 137.2L466.6 81.8C454.7 70.4 438.8 64 422.3 64L288 64zM160 192C124.7 192 96 220.7 96 256L96 512C96 547.3 124.7 576 160 576L352 576C387.3 576 416 547.3 416 512L416 496L352 496L352 512L160 512L160 256L176 256L176 192L160 192z'/%3E%3C/svg%3E");
    --icon-import: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 640'%3E%3Cpath d='M320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64zM308.7 451.3L204.7 347.3C200.1 342.7 198.8 335.8 201.2 329.9C203.6 324 209.5 320 216 320L272 320L272 224C272 206.3 286.3 192 304 192L336 192C353.7 192 368 206.3 368 224L368 320L424 320C430.5 320 436.3 323.9 438.8 329.9C441.3 335.9 439.9 342.8 435.3 347.3L331.3 451.3C325.1 457.5 314.9 457.5 308.7 451.3z'/%3E%3C/svg%3E");
    --icon-move: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 640'%3E%3Cpath d='M470.6 566.6L566.6 470.6C575.8 461.4 578.5 447.7 573.5 435.7C568.5 423.7 556.9 416 544 416L480 416L480 96C480 78.3 465.7 64 448 64C430.3 64 416 78.3 416 96L416 416L352 416C339.1 416 327.4 423.8 322.4 435.8C317.4 447.8 320.2 461.5 329.3 470.7L425.3 566.7C437.8 579.2 458.1 579.2 470.6 566.7zM214.6 73.4C202.1 60.9 181.8 60.9 169.3 73.4L73.3 169.4C64.1 178.6 61.4 192.3 66.4 204.3C71.4 216.3 83.1 224 96 224L160 224L160 544C160 561.7 174.3 576 192 576C209.7 576 224 561.7 224 544L224 224L288 224C300.9 224 312.6 216.2 317.6 204.2C322.6 192.2 319.8 178.5 310.7 169.3L214.7 73.3z'/%3E%3C/svg%3E");
    --icon-delete: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 640'%3E%3Cpath d='M224 96C224 78.3 238.3 64 256 64L384 64C401.7 64 416 78.3 416 96L416 128L512 128C529.7 128 544 142.3 544 160C544 177.7 529.7 192 512 192L128 192C110.3 192 96 177.7 96 160C96 142.3 110.3 128 128 128L224 128L224 96zM160 224L480 224L464 512C462.1 547.8 432.5 576 396.7 576L243.3 576C207.5 576 177.9 547.8 176 512L160 224zM256 288C238.3 288 224 302.3 224 320L224 480C224 497.7 238.3 512 256 512C273.7 512 288 497.7 288 480L288 320C288 302.3 273.7 288 256 288zM384 288C366.3 288 352 302.3 352 320L352 480C352 497.7 366.3 512 384 512C401.7 512 416 497.7 416 480L416 320C416 302.3 401.7 288 384 288z'/%3E%3C/svg%3E");
    --icon-edit: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 640'%3E%3Cpath d='M535.6 85.7C513.7 63.8 478.3 63.8 456.4 85.7L432 110.1L529.9 208L554.3 183.6C576.2 161.7 576.2 126.3 554.3 104.4L535.6 85.7zM236.4 305.7C230.3 311.8 225.6 319.3 222.9 327.6L193.3 416.4C190.4 425 192.7 434.5 199.1 441C205.5 447.5 215 449.7 223.7 446.8L312.5 417.2C320.7 414.5 328.2 409.8 334.4 403.7L496 241.9L398.1 144L236.4 305.7zM160 128C107 128 64 171 64 224L64 480C64 533 107 576 160 576L416 576C469 576 512 533 512 480L512 384C512 366.3 497.7 352 480 352C462.3 352 448 366.3 448 384L448 480C448 497.7 433.7 512 416 512L160 512C142.3 512 128 497.7 128 480L128 224C128 206.3 142.3 192 160 192L256 192C273.7 192 288 177.7 288 160C288 142.3 273.7 128 256 128L160 128z'/%3E%3C/svg%3E");
}
.fa-folder-o {
    margin-left: -6px;
    display: inline-block !important;
    width: 16px !important;
    height: 16px !important;
    font-size: 0 !important;
    background-color: currentColor !important;
    -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 640'%3E%3Cpath d='M512 512L128 512C92.7 512 64 483.3 64 448L64 272L576 272L576 448C576 483.3 547.3 512 512 512zM576 224L64 224L64 160C64 124.7 92.7 96 128 96L266.7 96C280.5 96 294 100.5 305.1 108.8L343.5 137.6C349 141.8 355.8 144 362.7 144L512 144C547.3 144 576 172.7 576 208L576 224z'/%3E%3C/svg%3E");
    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 640'%3E%3Cpath d='M512 512L128 512C92.7 512 64 483.3 64 448L64 272L576 272L576 448C576 483.3 547.3 512 512 512zM576 224L64 224L64 160C64 124.7 92.7 96 128 96L266.7 96C280.5 96 294 100.5 305.1 108.8L343.5 137.6C349 141.8 355.8 144 362.7 144L512 144C547.3 144 576 172.7 576 208L576 224z'/%3E%3C/svg%3E");
    -webkit-mask-repeat: no-repeat !important;
    mask-repeat: no-repeat !important;
    -webkit-mask-position: center !important;
    mask-position: center !important;
    -webkit-mask-size: contain !important;
    mask-size: contain !important;
}
.folder h3 {
    width: 140px;
    text-align: center !important;
    text-transform: uppercase !important;
}
.folder h3 {
    display: flex !important;
    align-items: center !important;
    text-transform: uppercase !important;
}
.folder h3::before,
.folder h3::after {
    content: "" !important;
    height: 1px !important;
    background: currentColor !important;
    opacity: 0.5 !important;
    flex: 1 !important;
}
.folder h3::before {
    margin-right: 10px !important;
}
.folder h3::after {
    margin-left: 10px !important;
}
img[src="https://play.pokemonshowdown.com/pokemonshowdownbeta.png"]
{
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/psremastered.png");
}
body[style*="charizards"] img[src="https://play.pokemonshowdown.com/pokemonshowdownbeta.png"]
{
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/remastered-ps-giratina.png");
}
body[style*="horizon"] img[src="https://play.pokemonshowdown.com/pokemonshowdownbeta.png"]
{
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/remastered-ps-rayquaza.png");
}
body[style*="ocean"] img[src="https://play.pokemonshowdown.com/pokemonshowdownbeta.png"]
{
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/remastered-ps-palkia.png");
}
body[style*="shaymin"] img[src="https://play.pokemonshowdown.com/pokemonshowdownbeta.png"]
{
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/remastered-ps-pikachu.png");
}
.menugroup .button,
h2,
.message-log h2,
.turn,
.Hellodex-module-content--BzZyh {
    font-family: Lexend, Trebuchet MS, Verdana, Helvetica;
}
div.battle
    > div
    > div:nth-child(5)
    > div:nth-child(2)
    > div[style*="left: 302.5px"] {
    left: 300px !important;
    top: 100px !important;
}
div.battle
    > div
    > div:nth-child(5)
    > div:nth-child(2)
    > div[style*="left: 380.5px"] {
    left: 490px !important;
    top: 100px !important;
}
div.battle
    > div
    > div:nth-child(5)
    > div:nth-child(3)
    > div[style*="left: 126.5px"] {
    left: 130px !important;
    top: 200px !important;
}
div.battle
    > div
    > div:nth-child(5)
    > div:nth-child(3)
    > div[style*="left: 236.5px"] {
    left: 335px !important;
    top: 205px !important;
}
@supports (content-visibility: auto) {
    .dark .team small {
        filter: drop-shadow(1px 1px 0px #000);
    }
}
#room-teambuilder {
    backdrop-filter: blur(5px);
    width: 710px !important;
    overflow-x: hidden !important;
}
#room-resources {
    backdrop-filter: blur(8px);
    overflow-x: hidden !important;
}
button[name="closeHide"] {
    display: none;
}
#room-pokepaste {
    backdrop-filter: blur(5px);
}
body,
.battle,
.button,
details.readmore summary:after,
.pm-buttonbar button,
.textbox,
.chatbox textarea,
.userlist li button,
.select,
.team,
button,
select,
.battle-log,
.checkbox,
.userlist li,
.folder .selectFolder,
.popupmenu button.folderButton,
.popupmenu button.folderButtonOpen,
.popupmenu button.button,
.setmenu button,
.teamlist button,
.utilichart .sortcol,
.utilichart .filter,
.searchboxwrapper .filter,
.teambar button,
button.subtle,
.option,
.battle-log-add,
.movemenu button,
.switchmenu button,
.Hellodex-module-authorButton--AXjR5,
.Hellodex-module-extensionVersion--XFNex,
.Hellodex-module-extensionVersion--XFNex,
.BaseButton-module-container--px4Ae {
    font-family: Lexend, Trebuchet MS, Verdana, Helvetica;
}
::selection {
    background: hsla(210, 50%, 50%, 0.6);
    color: hsl(0, 0%, 100%);
    text-shadow: none;
}
.dark .setchart,
.dark .setchart-nickname {
    background-color: #2c2c2c;
    box-shadow: none;
}
.ps-popup,
.logo,
.userlist-count,
.tournament-title,
.pm-window h3,
.pm-buttonbar,
.menugroup,
.header,
.teamchartbox,
.folderpane,
.teampane,
.pad:not(.ladder),
.userlist,
.battle-controls,
.battle,
.teambuilder-results,
.tournament-bracket-tree {
    user-select: none;
}
.battle,
.dark .battle {
    border-radius: 6px;
    border: none;
    background: none;
    color: hsl(0, 0%, 100%);
    margin: 6px;
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
}
.ps-room.small-layout .battle {
    margin: 0;
    box-shadow: none;
}
.battle-log-add,
.ps-room .battle-controls,
.battle-log,
.dark .battle-log-add,
.dark .battle-controls,
.dark .battle-log,
.dark .battle-log .chat > em {
    font-family: "Lexend", sans-serif !important;
    color: hsl(0, 0%, 100%);
    background: none;
}
.battle,
.battle-log,
.battle-log-add,
.dark .battle,
.dark .battle-log,
.dark .battle-log-add {
    border-color: hsla(0, 0%, 60%, 0.15);
}
::-webkit-scrollbar {
    width: 10px !important;
    height: 10px !important;
}
::-webkit-scrollbar-thumb {
    border-radius: 5px !important;
    box-shadow: inset 0 0 0 2px hsl(275 0 100 / 0.65) !important;
    border: 4px solid transparent !important;
    background: none !important;
}
::-webkit-scrollbar-track {
    background: none !important;
    border: none !important;
}
::-webkit-scrollbar-corner {
    background: none !important;
}
input[type="range"]::-webkit-slider-runnable-track,
.dark input[type="range"]::-webkit-slider-runnable-track,
input[type="range"]:hover::-webkit-slider-runnable-track {
    background: hsla(0, 0%, 60%, 0.15);
    box-shadow: none;
    border: none;
    border-radius: 6px;
}
input[type="range"]::-webkit-slider-thumb {
    background: hsl(210, 50%, 50%);
    border: none;
    box-shadow: none;
    margin-top: -3px;
    transition: 0.15s;
    width: 10px;
    height: 10px;
    border-radius: 3px;
}
input[type="range"]:hover::-webkit-slider-thumb {
    background: hsl(210, 50%, 50%);
    border-color: hsl(210, 50%, 50%);
}
input[type="range"]:focus::-webkit-slider-thumb {
    box-shadow: none;
    border-color: hsl(210, 50%, 50%);
}
input[type="range"]:active::-webkit-slider-thumb {
    border-color: hsl(210, 50%, 50%);
    box-shadow: 0 0 0 3px hsla(210, 50%, 50%, 0.4);
}
.checkbox {
    transition: 0.15s;
    text-shadow: none;
    color: hsl(0, 0%, 100%);
    border-radius: 6px;
    padding: 3px;
}
.checkbox:hover,
.menugroup .checkbox:hover,
.dark .checkbox:hover {
    background-color: hsla(0, 0%, 60%, 0.15);
    color: hsl(0, 0%, 100%);
    outline: transparent;
}
.checkbox:has(input:focus-visible) {
    background-color: hsla(0, 0%, 60%, 0.15);
}
.checkbox abbr {
    text-decoration: none;
}
.checkbox input {
    outline: transparent;
}
input[type="checkbox"][name="private"] {
    margin: -2.5px 6px 0 0 !important;
}
input[type="checkbox"] {
    appearance: none !important;
    -webkit-appearance: none !important;
    -moz-appearance: none !important;
    width: 16px !important;
    height: 16px !important;
    margin: -1px 6px 0 0 !important;
    padding: 0 !important;
    background: #ffffff73 !important;
    border: 2px solid #c7ccda !important;
    border-radius: 4px !important;
    cursor: pointer !important;
    vertical-align: middle !important;
    box-sizing: border-box !important;
    transition: background-color 0.15s ease, border-color 0.15s ease,
        box-shadow 0.15s ease !important;
    transform: none !important;
}
input[type="checkbox"]:hover {
    border-color: #858c9f !important;
    box-shadow: 0 0 0 3px rgba(37, 42, 61, 0.08) !important;
    transform: none !important;
}
input[type="checkbox"]:checked {
    background-color: #252a3d !important;
    border-color: #252a3d !important;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3.5 8l2.5 2.5 6-6' fill='none' stroke='white' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") !important;
    background-size: 11px 11px !important;
    background-position: center !important;
    background-repeat: no-repeat !important;
    transform: none !important;
}
input[type="checkbox"]:checked:hover {
    background-color: #252a3d !important;
    border-color: #252a3d !important;
    transform: none !important;
}
input[type="checkbox"]:focus-visible {
    outline: none !important;
    box-shadow: 0 0 0 3px rgba(37, 42, 61, 0.15) !important;
    transform: none !important;
}
input[type="checkbox"]:active {
    transform: none !important;
}
input[type="checkbox"]:disabled {
    opacity: 0.5 !important;
    cursor: not-allowed !important;
    transform: none !important;
}
.message-log h2,
.dark .message-log h2 {
    background: hsl(0 0 100 / 0.2);
    margin-left: 0px;
    border: none;
    border-radius: 6px;
    width: 98%;
}
.message-log .rated {
    padding-left: 0;
}
.message-log .rated strong {
    background: hsl(330, 50%, 50%);
    color: hsl(0, 0%, 100%);
    font-size: 15px;
}
body[style*="charizards"] .message-log .rated strong {
    background: #816ca5;
    color: hsl(0, 0%, 100%);
}
body[style*="horizon"] .message-log .rated strong {
    background: #277c39;
    color: hsl(0, 0%, 100%);
}
body[style*="ocean"] .message-log .rated strong {
    background: #3f7894;
    color: hsl(0, 0%, 100%);
}
body[style*="shaymin"] .message-log .rated strong {
    background: #a18100;
    color: hsl(0, 0%, 100%);
}
.chat > strong,
.dark .chat > strong {
    color: hsl(210, 50%, 50%);
}
.battle-history em[style="color:#445566;display:block;"] {
    color: hsl(210, 50%, 50%) !important;
}
hr,
.dark hr {
    border-color: hsla(0, 0%, 60%, 0.15);
    border-width: 2px;
}
.infobox,
.dark .infobox {
    border-color: hsl(210, 50%, 50%);
    background: hsl(210, 50%, 50%, 0.1);
    padding: 2px 5px 2px 5px !important;
    backdrop-filter: blur(5px);
}
.tournament-message-end-bracket-overflowing {
    border: 1px solid hsl(210, 50%, 50%);
    margin: 3px 0;
}
.turn {
    width: 82px;
    border: 1px solid hsla(0, 0%, 40%, 0.15);
    opacity: 1 !important;
    font-size: 12pt;
    padding-top: 6px;
    padding-bottom: 6px;
    background: radial-gradient(
        hsla(210, 20%, 10%, 0.6),
        hsla(210, 20%, 10%, 0.7)
    );
    color: white;
    backdrop-filter: blur(35px) saturate(180%);
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
    text-align: center;
}
.turn::before {
    display: block;
    font-size: 18pt;
}
code,
.code,
.spoiler:hover code,
.spoiler:active code,
.spoiler-shown code,
.dark code,
.dark .code,
.dark .spoiler:hover code,
.dark .spoiler:active code,
.dark .spoiler-shown code {
    background: hsla(0, 0%, 60%, 0.3);
    border-color: hsl(0, 0%, 60%);
    color: hsl(0, 0%, 100%);
    border-radius: 3px;
}
.greentext {
    color: #ffa24b !important;
}
.spoiler {
    border-radius: 3px;
    background: currentcolor;
    color: hsl(0, 0%, 60%);
}
.spoiler:hover,
.spoiler:active,
.spoiler-shown,
.dark .spoiler:hover,
.dark .spoiler:active,
.dark .spoiler-shown {
    color: hsl(0, 0%, 100%);
    cursor: pointer;
    background: hsla(0, 0%, 60%, 0.3);
}
kbd,
.dark kbd {
    background: hsla(0, 0%, 60%, 0.15);
    border-color: hsla(0, 0%, 60%, 0.3);
    border-radius: 4px;
}
.broadcast-blue {
    background: linear-gradient(
        135deg,
        hsl(210, 55%, 50%, 0.7) 0%,
        hsl(210, 55%, 50%, 0.5) 100%
    ) !important;
    border: 2px solid hsl(210, 55%, 50%, 0.8);
    color: hsl(0, 0%, 100%);
}
.broadcast-blue a,
.dark .broadcast-blue a,
.broadcast-blue a:visited,
.dark .broadcast-blue a:visited {
    color: hsl(210, 55%, 80%);
}
.broadcast-green {
    background: linear-gradient(
        135deg,
        hsl(120, 55%, 50%, 0.7) 0%,
        hsl(120, 55%, 50%, 0.5) 100%
    ) !important;
    border: 2px solid hsl(120, 55%, 50%, 0.8);
    color: hsl(0, 0%, 100%);
}
.broadcast-green a,
.dark .broadcast-green a,
.broadcast-green a:visited,
.dark .broadcast-green a:visited {
    color: hsl(120, 55%, 80%);
}
.broadcast-red {
    background: linear-gradient(
        135deg,
        hsl(0, 100%, 61%, 0.7) 0%,
        hsl(0, 100%, 61%, 0.5) 100%
    ) !important;
    border: 2px solid hsl(0, 100%, 61%, 0.8);
    color: hsl(0, 0%, 100%);
}
.broadcast-red a,
.dark .broadcast-red a,
.broadcast-red a:visited,
.dark .broadcast-red a:visited {
    color: hsl(0, 55%, 80%);
}
.message-announce {
    border-radius: 4px;
}
.chat.mine,
.dark .chat.mine {
    background: hsla(0, 0%, 60%, 0.15);
}
.message-throttle-notice,
.message-error,
.dark .message-error {
    color: hsl(0, 100%, 67%);
}
.highlighted,
.dark .highlighted {
    background: hsla(210, 50%, 50%, 0.4);
}
.revealed,
.dark .revealed {
    background: hsla(330, 50%, 50%, 0.4);
}
.message-announce {
    background: hsl(210, 55%, 50%);
    color: hsl(0, 0%, 100%);
}
.message-announce a,
.dark .message-announce a {
    color: inherit;
}
.textbox:not(
        .setchart .textbox,
        .setchart-nickname .textbox,
        .statform input.numform
    ) {
    font-family: "Lexend", sans-serif !important;
    padding: 2px 5px;
}
.textbox,
.dark .textbox,
.ps-room .pad input,
.ps-room textarea,
input[name="bestofvalue"] {
    border-color: transparent;
    background: hsla(0, 0%, 60%, 0.15);
    box-shadow: none;
    border-radius: 6px;
    transition: 0.15s;
    color: hsl(0, 0%, 100%);
    outline: transparent;
}
.textbox:hover,
.dark .textbox:hover,
.ps-room .pad input:hover,
.ps-room textarea:hover,
input[name="bestofvalue"]:hover {
    background-color: hsla(0, 0%, 60%, 0.3);
    box-shadow: none;
    border-color: transparent;
}
.textbox:focus,
.dark .textbox:focus,
.ps-room .pad input:focus,
.ps-room textarea:focus,
input[name="bestofvalue"]:focus {
    background: hsla(0, 0%, 60%, 0.3);
    box-shadow: none;
    border-color: transparent;
    animation: shift 1.5s infinite;
    outline: transparent;
}
@keyframes shift {
    0% {
        background: hsla(0, 0%, 60%, 0.3);
    }
    50% {
        background: hsla(0, 0%, 60%, 0.15);
    }
    100% {
        background: hsla(0, 0%, 60%, 0.3);
    }
}
input::placeholder {
    color: hsl(0, 0%, 60%);
}
.textbox.disabled,
.textbox:disabled,
.dark .textbox.disabled,
.dark .textbox:disabled,
.textbox.disabled:hover,
.textbox:disabled:hover {
    background: hsla(0, 0%, 60%, 0.15);
    color: hsl(0, 0%, 100%);
    opacity: 0.4;
}
.battle,
.innerbattle,
.backdrop {
    width: 758px;
    height: 400px;
}
.battle {
    border: 1px solid black !important;
}
.battle-controls {
    top: 410px !important;
    backdrop-filter: blur(5px);
    background: rgb(0 0 0 / 0.65) !important;
    padding-top: 10px !important;
    padding-left: 1px !important;
    margin: 6px !important;
    margin-top: 3px !important;
    border-radius: 6px !important;
    width: 759px !important;
    min-height: 243px !important;
    max-height: 243px !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
}
.whatdo > strong {
    color: #c1c1c1;
}
.battle-controls .whatdo small {
    opacity: 0.8;
    font-size: 11px;
    border: 1px solid rgb(5 255 130);
    background: rgb(5 255 130 / 0.2);
    color: rgb(5 255 130);
}
.battle-controls .whatdo small.weak {
    font-size: 11px;
    border: 1px solid rgb(255 255 66);
    background: rgb(255 255 66 /0.2);
    color: rgb(255 255 66);
}
.battle-controls .whatdo small.critical {
    border: 1px solid rgb(255 66 66);
    background: rgb(255 66 66 /0.2);
    color: rgb(255 66 66);
}
.controls:has(> .movecontrols:nth-child(2)) {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    grid-template-rows: auto auto !important;
    gap: 5px !important;
}
.controls:has(> .movecontrols:nth-child(2)) {
    position: relative !important;
}
.controls:has(> .movecontrols:nth-child(2))::after {
    content: "" !important;
    position: absolute !important;
    top: 0px !important;
    bottom: 10px !important;
    left: 50% !important;
    width: 1px !important;
    background: rgba(255, 255, 255, 0.2) !important;
    border-radius: 2px !important;
    transform: translateX(-50%) !important;
    pointer-events: none !important;
    z-index: 999 !important;
}
.controls:has(> .movecontrols:nth-child(2)) > .whatdo {
    grid-column: 1 / 3 !important;
    grid-row: 1 !important;
}
.controls:has(> .movecontrols:nth-child(2)) > .movecontrols {
    grid-column: 1 !important;
    grid-row: 2 !important;
}
.controls:has(> .movecontrols:nth-child(2)) > .switchcontrols {
    padding-bottom: 10px !important;
    grid-column: 2 !important;
    grid-row: 2 !important;
    text-align: right !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-end !important;
}
.controls:has(> .movecontrols:nth-child(2)) .switchselect {
    width: 100% !important;
    text-align: right !important;
}
.controls:has(> .movecontrols:nth-child(2)) .switchmenu {
    margin-left: 10px !important;
    margin-right: 6px !important;
    align-self: flex-start !important;
    display: flex !important;
    flex-wrap: wrap !important;
}
.controls:has(> .movecontrols:nth-child(2)) .moveselect button {
    margin-top: -4px;
    color: #ff5858 !important;
    padding: 0px 0px 0px 15px !important;
}
.controls:has(> .movecontrols:nth-child(2)) .switchselect button {
    margin-top: -4px;
    margin-bottom: 4px;
    color: #58a0ff !important;
    padding: 0px 0px 0px 15px !important;
}
.controls:has(> .movecontrols:nth-child(2)) .shiftselect button:hover {
    background: none;
}
.controls:has(> .movecontrols:nth-child(2)) .shiftselect button {
    margin-top: -4px;
    margin-bottom: 4px;
    color: #b690e4 !important;
    padding: 0px 0px 0px 15px !important;
}
.controls:has(> .movecontrols:nth-child(2)) .moveselect button::before {
    content: "\f101";
    font-family: "FontAwesome" !important;
    font-weight: 900 !important;
    color: #ff5858 !important;
    margin-right: 6px;
}
.controls:has(> .movecontrols:nth-child(2)) .shiftselect button::before {
    content: "\f101";
    font-family: "FontAwesome" !important;
    font-weight: 900 !important;
    color: #b690e4 !important;
    margin-right: 6px;
}
.controls:has(> .movecontrols:nth-child(2)) .switchselect button::before {
    content: "\f101";
    font-family: "FontAwesome" !important;
    font-weight: 900 !important;
    color: #58a0ff !important;
    margin-right: 6px;
}
.switchselect button {
    margin-top: 4px;
    margin-bottom: 4px;
    color: #58a0ff !important;
    padding: 0px 0px 0px 15px !important;
}
.switchselect button::before {
    content: "\f101";
    font-family: "FontAwesome" !important;
    font-weight: 900 !important;
    color: #58a0ff !important;
    margin-right: 6px;
}
.switchselect button:hover,
.moveselect button:hover {
    background: none !important;
}
.controls:has(> .movecontrols:nth-child(2)) .movemenu {
    zoom: 0.92 !important;
    margin-top: 6px !important;
    margin-left: 4px !important;
}
.switchmenu button {
    width: 113px;
    min-height: 35px;
    background: hsla(0, 0%, 60%, 0.15);
    font-family: "Lexend", sans-serif !important;
    color: hsl(0, 0%, 100%);
    text-shadow: none;
    box-shadow: none;
    border: 2px solid hsla(0, 0%, 60%, 0.15);
    transition: 0.15s;
}
.switchmenu button:hover {
    background: hsla(0, 0%, 60%, 0.3);
    border: 2px solid hsla(0, 0%, 60%, 0.3);
}
.switchmenu button.disabled,
.switchmenu button:disabled {
    background: hsla(0, 0%, 60%, 0.15) !important;
    border-color: hsla(0, 0%, 60%, 0.15) !important;
    color: hsl(0, 0%, 100%) !important;
    opacity: 0.4;
}
.allyparty button .picon,
.switchmenu button .picon {
    float: left;
    margin: -6px -3px -6px -4px;
    opacity: 0.8;
}
.switchmenu button .hpbar {
    border: 1px solid #494949 !important;
    background: #6e6e6e !important;
    transform: scaleX(1.13);
    margin-left: 5px;
    width: 92px;
}
.switchmenu button .hpbar span {
    height: 2px !important;
    border: none !important;
    background: #05ff82;
    border-radius: 25px !important;
}
.switchmenu button .hpbar-yellow span {
    background-color: #ffff42 !important;
}
.switchmenu button .hpbar-red span {
    background-color: #ff4242 !important;
}
.shiftcontrols {
    position: absolute;
    bottom: 10px;
    left: 380px;
}
button[name="chooseShift"] {
    text-align: center;
    padding: 2px 4px 2px 4px;
}
.ps-room .battle-log,
.Calcdex-module-overlayContainer--S6h8N {
    backdrop-filter: blur(5px);
    background: rgb(0 0 0 / 0.65) !important;
    overflow-y: auto !important;
    margin: 6px;
    margin-bottom: -10px !important;
    border-radius: 6px 6px 0px 0px !important;
    border: none;
    overflow-x: hidden !important;
    left: 766px;
    height: 626px;
}
.ps-room .battle-log-add {
    min-height: 0px !important;
    padding: 7px !important;
    margin: 5px 6px 7px 6px !important;
    border-radius: 0px 0px 6px 6px !important;
    background: rgb(0 0 0 / 0.65) !important;
    border-top: 1px solid #9797977a;
    border-left: 1px solid #f000;
    left: 766px;
}
.ps-room .chat-log-add {
    min-height: 0px !important;
    background: none !important;
    padding: 7px !important;
    margin: 0px !important;
    border-top: 1px solid #9797977a;
}
.Calcdex-module-overlayContainer--S6h8N {
    height: 660px;
}
.chat-log {
    background: #0000 !important;
    bottom: 33px;
}
.ps-room.ps-room-light,
.dark .ps-room.ps-room-light {
    font-family: "Lexend", sans-serif;
    border: none;
    border-radius: 6px;
    margin: 6px;
    color: hsl(0, 0%, 100%);
    box-shadow: none;
    max-height: 660px;
}
.chatbox {
    padding: 0px !important;
}
.chatbox label {
    text-align: left;
    margin-top: 1.5px;
}
.tournament-wrapper.active + .chat-log {
    top: 31px;
}
.tournament-wrapper {
    z-index: 1;
    border-bottom: 1px solid hsla(0, 0%, 60%, 0.15);
    height: 30px;
    line-height: 30px;
}
.tournament-title {
    white-space: nowrap;
    overflow: hidden;
    height: 30px;
}
.tournament-status,
.tournament-toggle {
    display: none;
}
.tournament-status,
.dark .tournament-status {
    border-color: hsla(0, 0%, 60%, 0.15);
    background: none;
    color: hsl(0, 0%, 100%);
}
.tournament-toggle,
.dark .tournament-toggle {
    border-color: hsla(0, 0%, 60%, 0.15);
    background: none;
    color: hsl(0, 0%, 100%);
}
.tournament-box,
.dark .tournament-box {
    background: hsl(210, 40%, 25%);
    border: none;
    margin: 6px;
    margin-top: 7px;
    border-radius: 6px;
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
}
.tournament-box,
.dark .tournament-box {
    background: hsl(210 0 0 / 0.7);
    backdrop-filter: blur(10px);
    border: none;
    margin: 6px 6px 0 6px;
    border-radius: 6px;
}
.tournament-tools {
    border: none;
}
.tournament-bracket-tree-node > rect {
    color: hsl(0, 0%, 100%);
    fill: hsl(210, 40%, 20%);
    stroke: transparent;
}
.tournament-bracket-tree-node-win > rect {
    color: hsl(0 0 0 / 0.5);
    fill: hsl(210, 50%, 50%);
    stroke: transparent;
}
.tournament-bracket-tree-node-loss > rect {
    color: hsl(0, 0%, 100%);
    fill: hsl(330, 50%, 50%);
    stroke: transparent;
}
.tournament-bracket-tree-node rect.tournament-bracket-tree-win {
    fill: rgb(0 151 80 / 0.7);
    stroke: rgb(0 151 80 / 0.7);
}
.tournament-bracket-tree-link {
    stroke: hsl(210, 40%, 20%);
    stroke-width: 3px;
}
.tournament-bracket-tree-link-active {
    stroke: hsl(210, 50%, 50%);
    z-index: 10;
}
.tournament-bracket-tree-node > text {
    fill: rgb(255 255 255 / 0.502);
    font-size: 10px;
}
.tournament-bracket-tree-node-match-team-draw,
.tournament-bracket-tree-node-match-team-loss {
    fill: hsl(0, 0%, 100%);
}
.dark .tournament-bracket-tree-node-match-team-draw,
.dark .tournament-bracket-tree-node-match-team-loss {
    fill: hsl(0, 0%, 0%);
}
.tournament-bracket-tree-node-match-team {
    font-weight: normal;
}
.tournament-bracket-tree-node > text > a,
.tournament-bracket-tree-node > text > a:hover {
    fill: hsl(210, 50%, 50%);
}
.battle-userlist {
    font-family: "Lexend", sans-serif;
    left: 760px !important;
    top: 6px;
    border-color: hsla(0, 0%, 60%, 0.15);
    box-sizing: border-box;
    width: 146px;
}
.userlist li {
    border: none;
}
.userlist li em.group {
    color: hsl(0, 0%, 60%);
}
.userlist li button {
    transition: 0.15s;
    border-radius: 0;
}
.userlist li button:hover,
.dark .userlist li button:hover,
.userlist li button:active,
.dark .userlist li button:active,
.userlist li button:focus-visible,
.dark .userlist li button:focus-visible {
    background: hsla(0, 0%, 60%, 0.15);
    outline: transparent;
}
.userlist-maximized li button:hover,
.dark .userlist-maximized li button:hover,
.userlist-maximized li button:active,
.dark .userlist-maximized li button:active,
.userlist-maximized li button:focus-visible,
.dark .userlist-maximized li button:focus-visible {
    font-family: "Lexend", sans-serif;
    background: rgb(255 255 255 / 0.1);
}
.dark .userlist strong,
.dark .userlist span {
    font-family: "Lexend", sans-serif;
    text-shadow: none;
}
.userlist {
    z-index: 1;
}
.dark .userlist .username {
    font-family: "Lexend", sans-serif;
    filter: none;
}
.dark .username span {
    filter: brightness(1.2);
}
.userlist-count {
    transition: 0.15s;
    border-radius: 0;
}
.userlist-minimized .userlist-count:hover,
.userlist-maximized .userlist-count:hover,
.dark .userlist-minimized .userlist-count:hover,
.dark .userlist-maximized .userlist-count:hover {
    background: rgb(255 255 255 / 0.1);
}
.userlist-minimized,
.userlist-maximized,
.dark .userlist-minimized,
.dark .userlist-maximized {
    background: hsl(210 0 0 / 0.7);
    backdrop-filter: blur(10px);
    border: none;
    border-radius: 6px;
    color: hsl(0, 0%, 100%);
    margin-left: 6px;
    margin-top: 6px;
    margin-bottom: 6px;
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
}
.dark .userlist-minimized,
.dark .userlist-maximized {
    max-height: 607px;
}
.tournament-wrapper.active ~ .userlist-minimized,
.dark .tournament-wrapper.active ~ .userlist-minimized,
.tournament-wrapper.active ~ .userlist-maximized,
.dark .tournament-wrapper.active ~ .userlist-maximized {
    margin-top: 36px;
}
.ps-room-opaque .userlist {
    margin-left: 18px;
}
.messagebar {
    z-index: 22;
    background: rgba(0, 0, 0, 0.75);
    color: #ffffff !important;
    font-family: "Lexend", sans-serif !important;
}
.messagebar > p {
    color: #fff;
}
.messagebar > p > small {
    color: #ababab;
}
.battle .result strong {
    padding: 1px 5px !important;
    color: #ffffff !important;
}
.battle .abilityresult strong {
    border-radius: 3px !important;
}
.weather em {
    display: block;
    margin: 24px 0 0 115px;
    font-family: "Lexend", sans-serif !important;
    font-size: 12pt;
    text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff,
        1px 1px 0 #fff, -1px 0px 0 #fff, 1px 0px 0 #fff, 0px -1px 0 #fff,
        0px 1px 0 #fff !important;
}
.statbar {
    padding: 2px 4px;
}
.status {
    padding: 0px !important;
}
.statbar .hpbar {
    border: 2px solid #202020 !important;
    background: #202020 !important;
    z-index: 2 !important;
    transform: scaleX(1.2) !important;
    height: 8px !important;
    border-radius: 25px 25px 25px 0px !important;
}
.statbar .hpbar .prevhp {
    background: #00000000 !important;
    margin-bottom: 4.5px !important;
}
.statbar .hpbar .prevhp-yellow {
    background: #00000000 !important;
}
.statbar .hpbar .prevhp-red {
    background: #00000000 !important;
}
.statbar .hpbar .hp {
    height: 8px !important;
    border: none !important;
    background: #05ff82;
    border-radius: 25px !important;
}
.statbar .hpbar .hp-yellow {
    background-color: #ffff42 !important;
}
.statbar .hpbar .hp-red {
    background-color: #ff4242 !important;
}
.statbar .hpbar .hptext {
    background: #202020 !important;
    top: 10px !important;
    left: -4.4px !important;
    transform: scaleX(0.86) !important;
    font-weight: 550 !important;
    font-family: "Lexend", sans-serif !important;
    color: #ffffff !important;
    width: 35px !important;
    height: 13px !important;
    line-height: 13px !important;
    z-index: 2 !important;
    text-shadow: none !important;
    border-radius: 0 0 7px 7px !important;
}
.statbar .hpbar .hptextborder {
    border: none !important;
}
.rstatbar .hpbar .hptext {
    border-radius: 0 0 7px 7px !important;
}
.lstatbar .hpbar .hptext {
    border-radius: 0 0 7px 7px !important;
}
.statbar .status {
    transform: scaleX(0.834) !important;
    width: 184px;
    font-family: "Lexend", sans-serif !important;
    transform-origin: left center !important;
    display: flex;
    flex-wrap: wrap;
    align-content: stretch;
    justify-content: flex-start;
    align-items: flex-end;
    margin-left: -2px !important;
    margin-top: -2px !important;
}
.statbar .status > :first-child {
    margin-left: 37px !important;
}
.statbar .status > img {
    height: 13px !important;
    width: auto !important;
    margin-right: 2px;
    top: 0px !important;
}
.status > img:only-child {
    margin-top: 2px;
}
.status > img:nth-child(2),
.status > img:nth-child(3) {
    margin-top: 2px;
}
.battle .result,
.battle .result strong,
.battle .badresult strong,
.battle .goodresult strong,
.battle .neutralresult strong,
.battle .brnresult strong,
.battle .psnresult strong,
.battle .slpresult strong,
.battle .parresult strong,
.battle .frzresult strong {
    font-family: "Lexend", sans-serif !important;
}
.battle .abilityresult strong {
    color: #ffffff;
    background: #0088aa;
    border-radius: 0;
    padding: 2px 6px;
}
.statbar span.bad {
    background: linear-gradient(135deg, #b94a3f 0%, #7a2825 100%) !important;
    color: #ffffff !important;
    border: 0.5px solid #b94a3f !important;
}
.statbar span.good {
    background: linear-gradient(135deg, #3d9968 0%, #246544 100%) !important;
    color: #ffffff !important;
    border: 0.5px solid #3d9968 !important;
}
.statbar span.neutral {
    background: linear-gradient(135deg, #6a6a6a 0%, #454545 100%) !important;
    color: #ffffff !important;
    border: 0.5px solid #6a6a6a !important;
}
.statbar span {
    font-size: 9px !important;
    margin-top: 2.5px !important;
    margin-right: 2px !important;
    padding-left: 2px !important;
    padding-right: 2px !important;
}
.statbar strong {
    margin-bottom: 2px !important;
    font-weight: 550 !important;
    font-size: 12.5px;
    color: #ffffff !important;
    font-family: "Lexend", sans-serif !important;
    text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
        1px 1px 0 #000, -1px 0px 0 #000, 1px 0px 0 #000, 0px -1px 0 #000,
        0px 1px 0 #000 !important;
}
.statbar strong > img {
    display: none !important;
}
.statbar strong {
    position: relative !important;
    z-index: 20 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
}
.statbar strong small {
    text-shadow: none !important;
    order: -1 !important;
    display: block !important;
    width: 55px !important;
    height: 15px !important;
    box-sizing: border-box !important;
    padding-left: 10px !important;
    background: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/lvl-indicator.png")
        center / 100% 100% no-repeat !important;
    border: none !important;
    color: #fff !important;
    font-size: 11px !important;
    font-weight: 350 !important;
}
.statbar strong small::first-letter {
    color: #34344c00;
    text-shadow: none;
}
.statbar strong:not(:has(small))::after {
    content: "100";
    order: -1 !important;
    display: block !important;
    width: 55px !important;
    height: 15px !important;
    box-sizing: border-box !important;
    margin-bottom: 3px !important;
    padding-left: 27px !important;
    background: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/lvl-indicator.png") center / 100%
        100% no-repeat !important;
    border: none !important;
    color: #fff !important;
    font-size: 11px !important;
    font-weight: 350 !important;
    text-shadow: none !important;
    text-align: left !important;
}
#tooltipwrapper .tooltip {
    font-family: "Lexend", sans-serif !important;
    color: #d8d8d8;
    background: radial-gradient(
        hsla(210, 20%, 10%, 0.6),
        hsla(210, 20%, 10%, 0.7)
    );
    backdrop-filter: blur(35px) saturate(180%);
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
    border-color: hsla(0, 0%, 60%, 0.15);
    border-radius: 6px;
    transition: 0.15s;
    animation: none;
}
#tooltipwrapper.tooltip-locked .tooltip {
    background: radial-gradient(
        hsla(210, 20%, 10%, 0.6),
        hsla(210, 20%, 10%, 0.7)
    );
    border-color: hsla(0, 0%, 60%, 0.15);
    border-width: 1px;
    box-shadow: 0 5px 15px hsla(0, 0%, 0%, 0.4);
}
#tooltipwrapper .tooltip h2,
#tooltipwrapper .tooltip p.tooltip-section {
    border-color: hsla(0, 0%, 60%, 0.15);
    color: #d8d8d8;
}
.tooltip-locking-click .tooltip::before,
.tooltip-locking-click .tooltip::after,
.tooltip-locking-tap .tooltip::before,
.tooltip-locking-tap .tooltip::after {
    border-radius: 8px;
}
#tooltipwrapper .tooltip table td {
    vertical-align: top;
}
.tooltip div[style="border-top: 1px solid #888; background: #dedede"],
.tooltip div[style="border-top: 1px solid #888;"] {
    background: none !important;
    border-color: hsla(0, 0%, 60%, 0.15) !important;
}
.dark .ps-room.ps-room-opaque {
    background-color: rgb(0 0 0 / 0);
    color: #ddd;
}
.leftbar,
.rightbar {
    background: rgb(0 0 0 / 0.5);
    z-index: 22;
}
.leftbar {
    border-right: 1px solid rgba(0, 0, 0, 0.4);
}
.rightbar {
    border-left: 1px solid rgba(0, 0, 0, 0.4);
}
.sidecondition-auroraveil,
.sidecondition-safeguard,
.sidecondition-reflect,
.sidecondition-lightscreen {
    display: block !important;
    position: absolute !important;
    transform: perspective(900px) rotateY(-20deg) skewY(-2deg) scale(1.5) !important;
    transform-origin: center !important;
    box-shadow: none !important;
    backdrop-filter: blur(1px) !important;
    -webkit-backdrop-filter: blur(1px) !important;
    overflow: hidden !important;
    animation: screenShine 4s ease-in-out infinite !important;
}
.sidecondition-auroraveil {
    background: linear-gradient(
        115deg,
        rgba(70, 240, 255, 0.3),
        rgba(100, 190, 255, 0.24),
        rgba(170, 130, 255, 0.26),
        rgba(230, 120, 255, 0.3)
    ) !important;
    border: 2px solid rgba(220, 255, 255, 0.58) !important;
    border-radius: 16px !important;
    opacity: 0.68 !important;
}
.sidecondition-safeguard {
    background: linear-gradient(
        115deg,
        rgba(245, 245, 245, 0.3),
        rgba(255, 255, 255, 0.25),
        rgba(190, 190, 195, 0.28),
        rgba(235, 235, 240, 0.25)
    ) !important;
    border: 2px solid rgba(255, 255, 255, 0.68) !important;
    border-radius: 16px !important;
    opacity: 0.62 !important;
}
.sidecondition-reflect,
.sidecondition-lightscreen {
    border: 2px solid !important;
    border-radius: 5px !important;
    opacity: 0.64 !important;
}
.sidecondition-reflect {
    background: linear-gradient(
        115deg,
        rgba(255, 210, 40, 0.28),
        rgba(255, 235, 100, 0.22),
        rgba(255, 185, 20, 0.27),
        rgba(255, 245, 150, 0.2)
    ) !important;
    border-color: rgba(255, 235, 90, 0.82) !important;
}
.sidecondition-lightscreen {
    background: linear-gradient(
        115deg,
        rgba(210, 80, 255, 0.28),
        rgba(235, 130, 255, 0.23),
        rgba(175, 60, 230, 0.29),
        rgba(245, 170, 255, 0.22)
    ) !important;
    border-color: rgba(245, 190, 255, 0.78) !important;
}
.sidecondition-auroraveil::before,
.sidecondition-safeguard::before,
.sidecondition-reflect::before,
.sidecondition-lightscreen::before {
    content: "";
    position: absolute;
    inset: -20%;
    pointer-events: none;
    background: linear-gradient(
        110deg,
        transparent 30%,
        rgba(255, 255, 255, 0.04) 42%,
        rgba(255, 255, 255, 0.55) 50%,
        rgba(255, 255, 255, 0.06) 58%,
        transparent 70%
    );
    transform: translateX(-100%);
    animation: screenSweep 4s ease-in-out infinite;
}
.sidecondition-mist {
    display: block !important;
    position: absolute !important;
    background: linear-gradient(
        90deg,
        rgba(220, 220, 225, 0.18),
        rgba(250, 250, 250, 0.28),
        rgba(205, 205, 215, 0.18)
    ) !important;
    border: 2px solid rgba(240, 240, 245, 0.48) !important;
    border-radius: 16px !important;
    transform: perspective(900px) rotateY(-20deg) skewY(-2deg) scale(1.5) !important;
    transform-origin: center !important;
    box-shadow: none !important;
    opacity: 0.58 !important;
    backdrop-filter: blur(0.2px) !important;
    -webkit-backdrop-filter: blur(0.2px) !important;
    overflow: hidden !important;
    animation: mistForm 2.8s ease-out forwards !important;
}
.sidecondition-mist::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
            ellipse at 20% 50%,
            rgba(255, 255, 255, 0.32),
            transparent 40%
        ),
        radial-gradient(
            ellipse at 50% 35%,
            rgba(245, 245, 250, 0.38),
            transparent 45%
        ),
        radial-gradient(
            ellipse at 80% 55%,
            rgba(220, 220, 230, 0.3),
            transparent 42%
        );
    border-radius: 16px;
    transform: scale(0.25);
    opacity: 0;
    animation: mistCloud 2.8s ease-out forwards;
}
.sidecondition-mist::after {
    content: "";
    position: absolute;
    inset: 8%;
    border: 1px solid rgba(255, 255, 255, 0.28);
    border-radius: 14px;
    opacity: 0;
    transform: scale(0.2);
    animation: mistCore 2.8s ease-out forwards;
}
@keyframes screenSweep {
    0%,
    35% {
        transform: translateX(-100%);
        opacity: 0;
    }
    45% {
        opacity: 0.65;
    }
    65% {
        transform: translateX(100%);
        opacity: 0.65;
    }
    75%,
    100% {
        transform: translateX(100%);
        opacity: 0;
    }
}
@keyframes screenShine {
    0%,
    100% {
        filter: brightness(1) saturate(1.1);
    }
    50% {
        filter: brightness(1.14) saturate(1.25);
    }
}
@keyframes mistForm {
    0% {
        opacity: 0;
        transform: perspective(900px) rotateY(-12deg) scale(0.25);
    }
    45% {
        opacity: 0.35;
        transform: perspective(900px) rotateY(-12deg) scale(1.35);
    }
    75% {
        opacity: 0.52;
        transform: perspective(900px) rotateY(-12deg) scale(1.7);
    }
    100% {
        opacity: 0.58;
        transform: perspective(900px) rotateY(-12deg) scale(1.8);
    }
}
@keyframes mistCloud {
    0% {
        opacity: 0;
        transform: scale(0.2);
    }
    35% {
        opacity: 0.55;
        transform: scale(0.65);
    }
    65% {
        opacity: 0.6;
        transform: scale(1.15);
    }
    100% {
        opacity: 0.4;
        transform: scale(1.4);
    }
}
@keyframes mistCore {
    0% {
        opacity: 0;
        transform: scale(0.15);
    }
    40% {
        opacity: 0.5;
        transform: scale(0.6);
    }
    70% {
        opacity: 0.3;
        transform: scale(1);
    }
    100% {
        opacity: 0.15;
        transform: scale(1.15);
    }
}
.turnstatus-protect {
    display: block !important;
    position: absolute !important;
    background: linear-gradient(
        115deg,
        rgba(255, 100, 210, 0.3),
        rgba(210, 100, 255, 0.24),
        rgba(170, 70, 230, 0.28),
        rgba(255, 150, 235, 0.25)
    ) !important;
    border: 2px solid rgba(245, 180, 255, 0.78) !important;
    border-radius: 16px !important;
    transform: perspective(900px) rotateY(-25deg) scale(1.5) !important;
    transform-origin: center !important;
    box-shadow: none !important;
    opacity: 0.64 !important;
    backdrop-filter: blur(1px) !important;
    -webkit-backdrop-filter: blur(1px) !important;
    overflow: hidden !important;
    animation: screenShine 4s ease-in-out infinite !important;
}
.turnstatus-protect::before {
    content: "";
    position: absolute;
    inset: -20%;
    pointer-events: none;
    background: linear-gradient(
        110deg,
        transparent 30%,
        rgba(255, 255, 255, 0.04) 42%,
        rgba(255, 255, 255, 0.55) 50%,
        rgba(255, 255, 255, 0.06) 58%,
        transparent 70%
    );
    transform: translateX(-100%);
    animation: screenSweep 4s ease-in-out infinite;
}
.trainer-far {
    bottom: 75px !important;
    top: 10px !important;
}
.trainer-far > strong,
.trainer-near > strong {
    padding-left: 4px;
    padding-right: 4px;
    font-family: "Lexend", sans-serif !important;
    text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
        1px 1px 0 #000, -1px 0px 0 #000, 1px 0px 0 #000, 0px -1px 0 #000,
        0px 1px 0 #000 !important;
}
.innerbattle .backdrop {
    top: 0px !important;
    left: 0px;
    opacity: 1 !important;
    background-size: cover !important;
    background-blend-mode: multiply;
    background-attachment: fixed;
    transform: scale(1.1);
}
.innerbattle .weather {
    background-color: #0003 !important;
}
.innerbattle .backdrop[style*="aquacordetown.jpg"],
.innerbattle .backdrop[style*="aquacordetown.png"] {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/aquacordetown.png") !important;
}
.innerbattle .backdrop[style*="beach.jpg"],
.innerbattle .backdrop[style*="beach.png"] {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/beach.png") !important;
}
.innerbattle .backdrop[style*="city.jpg"],
.innerbattle .backdrop[style*="city.png"] {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/city.png") !important;
}
.innerbattle .backdrop[style*="dampcave.jpg"],
.innerbattle .backdrop[style*="dampcave.png"] {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/dampcave.png") !important;
}
.innerbattle .backdrop[style*="darkbeach.jpg"],
.innerbattle .backdrop[style*="darkbeach.png"] {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/darkbeach.png") !important;
}
.innerbattle .backdrop[style*="darkcity.jpg"],
.innerbattle .backdrop[style*="darkcity.png"] {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/darkcity.png") !important;
}
.innerbattle .backdrop[style*="darkmeadow.jpg"],
.innerbattle .backdrop[style*="darkmeadow.png"] {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/darkmeadow.png") !important;
}
.innerbattle .backdrop[style*="deepsea.jpg"],
.innerbattle .backdrop[style*="deepsea.png"] {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/deepsea.png") !important;
}
.innerbattle .backdrop[style*="desert.jpg"],
.innerbattle .backdrop[style*="desert.png"] {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/desert.png") !important;
}
.innerbattle .backdrop[style*="earthycave.jpg"],
.innerbattle .backdrop[style*="earthycave.png"] {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/earthycave.png") !important;
}
.innerbattle .backdrop[style*="elite4drake.jpg"],
.innerbattle .backdrop[style*="elite4drake.png"] {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/elite4drake.png") !important;
}
.innerbattle .backdrop[style*="forest.jpg"],
.innerbattle .backdrop[style*="forest.png"] {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/forest.png") !important;
}
.innerbattle .backdrop[style*="icecave.jpg"],
.innerbattle .backdrop[style*="icecave.png"] {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/icecave.png") !important;
}
.innerbattle .backdrop[style*="leaderwallace.jpg"],
.innerbattle .backdrop[style*="leaderwallace.png"] {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/leaderwallace.png") !important;
}
.innerbattle .backdrop[style*="library.jpg"],
.innerbattle .backdrop[style*="library.png"] {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/library.png") !important;
}
.innerbattle .backdrop[style*="meadow.jpg"],
.innerbattle .backdrop[style*="meadow.png"] {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/meadow.png") !important;
}
.innerbattle .backdrop[style*="orasdesert.jpg"],
.innerbattle .backdrop[style*="orasdesert.png"] {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/orasdesert.png") !important;
}
.innerbattle .backdrop[style*="orassea.jpg"],
.innerbattle .backdrop[style*="orassea.png"] {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/orassea.png") !important;
}
.innerbattle .backdrop[style*="skypillar.jpg"],
.innerbattle .backdrop[style*="skypillar.png"] {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/skypillar.png") !important;
}
.innerbattle .psychicterrainweather {
    background: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/psychic-terrain.png")
        no-repeat !important;
    background-size: cover !important;
}
.innerbattle .mistyterrainweather {
    background: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/misty-terrain.png")
        no-repeat !important;
    background-size: cover !important;
}
.innerbattle .grassyterrainweather {
    background: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/grassy-terrain.png")
        no-repeat !important;
    background-size: cover !important;
}
.innerbattle .electricterrainweather {
    background: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/electric-terrain.png")
        no-repeat !important;
    background-size: cover !important;
}
.gravityweather {
    background: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/gravity.png")
        no-repeat !important;
    background-size: cover !important;
}
.magicroomweather {
    background: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/magic-room.png")
        no-repeat !important;
    background-size: cover !important;
}
.trickroomweather {
    background: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/trick-room.png")
        no-repeat !important;
    background-size: cover !important;
}
.wonderroomweather {
    background: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/wonder-room.png")
        no-repeat !important;
    background-size: cover !important;
}
.innerbattle .hailweather,
.innerbattle .snowscapeweather {
    background: rgb(144 157 255 / 0.38)
        url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/hailstorm.gif")
        no-repeat !important;
    background-size: cover !important;
    background-blend-mode: multiply;
    background-position: center center !important;
    pointer-events: none !important;
    opacity: 0.5 !important;
    z-index: 21;
}
.innerbattle .sunweather,
.innerbattle .sunnydayweather {
    background: rgb(255 166 0 / 0.18)
        url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/sun.gif")
        no-repeat !important;
    background-size: cover !important;
    background-blend-mode: multiply;
    background-position: center top !important;
    pointer-events: none !important;
    opacity: 0.35 !important;
    z-index: 21;
}
.innerbattle .rainweather,
.innerbattle .raindanceweather {
    background: rgb(66 88 255 / 0.35)
        url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/rain.gif")
        no-repeat !important;
    background-size: cover !important;
    background-blend-mode: multiply;
    background-position: center center !important;
    pointer-events: none !important;
    opacity: 0.65 !important;
    z-index: 21;
}
.innerbattle .primordialseaweather {
    background: rgb(255 255 255)
        url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/heavy-rain.gif")
        no-repeat !important;
    background-size: cover !important;
    background-blend-mode: multiply;
    background-position: center bottom !important;
    pointer-events: none !important;
    opacity: 0.45 !important;
    z-index: 21;
}
.innerbattle .desolatelandweather {
    background: rgb(255 145 0 / 0.43)
        url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/desolate-land.gif")
        no-repeat !important;
    background-size: cover !important;
    background-blend-mode: multiply;
    background-position: center center !important;
    pointer-events: none !important;
    opacity: 0.5 !important;
    z-index: 21;
}
.desolatelandeather::before {
    content: "";
    position: absolute;
    transform: translateX(20%) rotate(30deg) skewX(3deg);
    inset: -15% -30%;
    pointer-events: none !important;
    background: repeating-linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 107, 0, 0.29) 10%,
        rgba(255, 240, 190, 0.5) 18%,
        rgba(255, 190, 90, 0.5) 27%,
        transparent 38%
    );
    filter: blur(7px);
    opacity: 0.7;
    animation: heatWaveFlow 5s linear infinite;
}
@keyframes heatWaveFlow {
    from {
        transform: translateX(-25%);
    }
    to {
        transform: translateX(25%);
    }
}
.innerbattle .sandstormweather {
    background: #ff9500b3
        url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/sandstorm.gif")
        no-repeat !important;
    background-size: cover !important;
    background-blend-mode: multiply;
    background-position: center center !important;
    pointer-events: none !important;
    opacity: 0.5 !important;
    z-index: 21;
}
.innerbattle .deltastreamweather {
    background: #ffffffb3
        url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/bgs/delta-stream.gif")
        no-repeat !important;
    background-size: cover !important;
    background-blend-mode: multiply;
    background-position: center bottom !important;
    pointer-events: none !important;
    opacity: 0.6 !important;
    z-index: 21;
}
img[alt="Bug"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/bug.png") !important;
}
img[alt="Dark"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/dark.jpg") !important;
}
img[alt="Dragon"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/dragoon.jpg") !important;
}
img[alt="Electric"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/electric.jpg") !important;
}
img[alt="Fairy"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/fairy.jpg") !important;
}
img[alt="Fighting"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/fighting.jpg") !important;
}
img[alt="Fire"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/fire.jpg") !important;
}
img[alt="Flying"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/flying.jpg") !important;
}
img[alt="Ghost"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/ghost.jpg") !important;
}
img[alt="Grass"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/grass.jpg") !important;
}
img[alt="Ground"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/ground.jpg") !important;
}
img[alt="Ice"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/ice.jpg") !important;
}
img[alt="Normal"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/normal.jpg") !important;
}
img[alt="Poison"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/poison.jpg") !important;
}
img[alt="Psychic"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/psychic.jpg") !important;
}
img[alt="Rock"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/rock.jpg") !important;
}
img[alt="Steel"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/steel.jpg") !important;
}
img[alt="Water"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/water.jpg") !important;
}
img[alt="Stellar"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/stellar.jpg") !important;
}
img[alt="Status"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/status.jpg") !important;
}
img[alt="Special"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/special.jpg") !important;
}
img[alt="Physical"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/physical.jpg") !important;
}
img:is(
        [alt="Normal"],
        [alt="Fire"],
        [alt="Water"],
        [alt="Electric"],
        [alt="Grass"],
        [alt="Ice"],
        [alt="Fighting"],
        [alt="Poison"],
        [alt="Ground"],
        [alt="Flying"],
        [alt="Psychic"],
        [alt="Bug"],
        [alt="Rock"],
        [alt="Ghost"],
        [alt="Dragon"],
        [alt="Dark"],
        [alt="Steel"],
        [alt="Fairy"],
        [alt="Stellar"]
    ) {
    width: 60px !important;
    border-radius: 3.5px !important;
    height: auto !important;
}
img:is([alt="Status"], [alt="Special"], [alt="Physical"]) {
    width: auto !important;
    border-radius: 3.5px !important;
}
.ps-pp-sprite,
img[src="https://archives.bulbagarden.net/media/upload/8/81/LitGhost.png"],
img[src*="/fx/"],
img[src*="/sprites/itemicons-sheet.png"],
img[src*="/sprites/gen5/"],
img[src*="/sprites/gen5-back/"],
img[src*="/sprites/gen5-shiny/"],
img[src*="/sprites/gen5-back-shiny/"],
img[src*="/sprites/ani/"],
img[src*="/sprites/ani-back/"],
img[src*="/sprites/ani-shiny/"],
img[src*="/sprites/ani-back-shiny/"] {
    image-rendering: crisp-edges !important;
    -ms-interpolation-mode: bicubic;
    transform: translateZ(0) scale(0.95);
    backface-visibility: hidden;
    filter: contrast(1.08) saturate(1.08) brightness(1.03)
        drop-shadow(0 1px 1px rgba(0, 0, 0, 0.35));
    -webkit-filter: contrast(1.08) saturate(1.08) brightness(1.03)
        drop-shadow(0 1px 1px rgba(0, 0, 0, 0.35));
}
#room-pokepaste .ps-pp-item-icon,
.picon,
.trainersprite,
.itemicon,
.itemiconcol span,
.iconcol span {
    image-rendering: crisp-edges !important;
}
.badges img[src$="randombattle_gold.png"],
.badges img[src$="gold.png"],
.badges img[src$="ou_gold.png"],
.badges img[src$="rotating_gold.png"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/gold.png") !important;
    margin: 0px 2px -10px 2px !important;
    width: 20px !important;
    height: 20px !important;
    aspect-ratio: 1 / 1;
    filter: grayscale(30%) brightness(70%);
}
.badges img[src$="randombattle_silver.png"],
.badges img[src$="silver.png"],
.badges img[src$="ou_silver.png"],
.badges img[src$="rotating_silver.png"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/silver.png") !important;
    margin: 0px 2px -10px 2px !important;
    width: 20px !important;
    height: 20px !important;
    aspect-ratio: 1 / 1;
    filter: grayscale(30%) brightness(70%);
}
.badges img[src$="randombattle_bronze.png"],
.badges img[src$="bronze.png"],
.badges img[src$="ou_bronze.png"],
.badges img[src$="rotating_bronze.png"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/bronze.png") !important;
    margin: 0px 2px -10px 2px !important;
    width: 20px !important;
    height: 20px !important;
    aspect-ratio: 1 / 1;
    filter: grayscale(30%) brightness(70%);
}
.chat .utilichart {
    padding: 1px 8px 1px 4px;
}
.chat .utilichart .movenamecol > a {
    text-decoration: none !important;
}
.chat .utilichart .movenamecol {
    width: auto !important;
}
.chat .utilichart .labelcol,
.chat .utilichart .widelabelcol,
.chat .utilichart .pplabelcol,
.chat .utilichart .movedesccol {
    margin-right: 10px;
}
.chat .utilichart .typecol {
    width: 136px;
}
.chat .utilichart .typecol > img:nth-child(1) {
    margin-left: 10px !important;
    margin-right: 5px !important;
}
.chat font[size="1"] {
    padding: 0px 8px 2px 10px;
}
.chat font[size="1"]::before {
    content: "\f101";
    font-family: "FontAwesome" !important;
    font-weight: 900 !important;
    color: #fff !important;
    margin-right: 6px;
}
.movebutton {
    width: 240px;
    margin: 5px;
    box-shadow: none !important;
    font-weight: 550;
    color: #ffffff;
    font-family: "Lexend", sans-serif;
    text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
        1px 1px 0 #000, -1px 0px 0 #000, 1px 0px 0 #000, 0px -1px 0 #000,
        0px 1px 0 #000;
    transition: transform 0.2s ease-in-out;
    position: relative;
    background-size: cover !important;
    background-blend-mode: multiply;
    background-position: center center !important;
    border-radius: 12px 10px 10px 12px;
    padding-left: 38px !important;
}
.movebutton:hover {
    filter: saturate(0.8) brightness(0.8) !important;
}
.movebutton:active {
    transform: scale(0.98) !important;
}
.movemenu small {
    color: rgba(255, 255, 255, 1) !important;
}
.movebutton small.type {
    font-size: 0 !important;
    line-height: 0 !important;
    color: transparent !important;
}
.movebutton small.type::before {
    content: "";
    position: absolute;
    left: -4px;
    top: 50%;
    transform: translateY(-50%);
    width: 45px;
    height: 45px;
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
}
.movebutton:disabled,
.movebutton:disabled:hover,
.movebutton:disabled:active {
    opacity: 1 !important;
    filter: grayscale(100%) brightness(0.9) !important;
    transform: none !important;
    cursor: not-allowed !important;
    box-shadow: none !important;
}
.movebutton:disabled small {
    color: #888 !important;
    text-shadow: 1px 1px 0 #000 !important;
}
.effectiveness-icon {
    display: none !important;
}
.type-Normal {
    background: rgb(130 134 125)
        url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/normal-bg.jpg")
        center 45% / cover no-repeat !important;
    border-color: rgb(130 134 125) !important;
}
.type-Fire {
    background: rgb(186 31 6)
        url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/fire-bg.jpg")
        center 45% / cover no-repeat !important;
    border-color: rgb(187 32 7) !important;
}
.type-Water {
    background: rgb(6 94 169)
        url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/water-bg.jpg")
        center 45% / cover no-repeat !important;
    border-color: rgb(6 94 169) !important;
}
.type-Electric {
    background: rgb(200 135 36)
        url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/electric-bg.jpg")
        center 45% / cover no-repeat !important;
    border-color: rgb(200 135 36) !important;
}
.type-Grass {
    background: rgb(0 137 12)
        url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/grass-bg.jpg")
        center 45% / cover no-repeat !important;
    border-color: rgb(0 137 12) !important;
}
.type-Ice {
    background: rgb(13 137 154)
        url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/ice-bg.jpg")
        center 45% / cover no-repeat !important;
    border-color: rgb(13 137 154) !important;
}
.type-Fighting {
    background: rgb(198 76 13)
        url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/fighting-bg.jpg")
        center 45% / cover no-repeat !important;
    border-color: rgb(198 77 14) !important;
}
.type-Poison {
    background: rgb(109 53 132)
        url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/poison-bg.jpg")
        center 45% / cover no-repeat !important;
    border-color: rgb(109 53 132) !important;
}
.type-Ground {
    background: rgb(116 61 29)
        url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/ground-bg.jpg")
        center 45% / cover no-repeat !important;
    border-color: rgb(116 61 29) !important;
}
.type-Flying {
    background: rgb(65 114 194)
        url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/flying-bg.jpg")
        center 45% / cover no-repeat !important;
    border-color: rgb(65 114 194) !important;
}
.type-Psychic {
    background: rgb(185 41 83)
        url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/psychic-bg.jpg")
        center 45% / cover no-repeat !important;
    border-color: rgb(185 41 83) !important;
}
.type-Bug {
    background: rgb(88 145 33)
        url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/bug-bg.jpg")
        center 45% / cover no-repeat !important;
    border-color: rgb(88 146 34) !important;
}
.type-Rock {
    background: rgb(117 101 40)
        url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/rock-bg.jpg")
        center 45% / cover no-repeat !important;
    border-color: rgb(117 101 40) !important;
}
.type-Ghost {
    background: rgb(175 107 255)
        url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/ghost-bg.png")
        center 45% / cover no-repeat !important;
    border-color: rgb(80 45 123) !important;
}
.type-Dragon {
    background: rgb(46 66 174)
        url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/dragon-bg.jpg")
        center 45% / cover no-repeat !important;
    border-color: rgb(44 66 174) !important;
}
.type-Dark {
    background: rgb(73 62 90)
        url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/dark-bg.png")
        center 45% / cover no-repeat !important;
    border-color: rgb(73 62 90) !important;
}
.type-Steel {
    background: rgb(42 101 129)
        url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/steel-bg.jpg")
        center 45% / cover no-repeat !important;
    border-color: rgb(42 101 129) !important;
}
.type-Fairy {
    background: rgb(183 94 160)
        url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/fairy-bg.jpg")
        center 45% / cover no-repeat !important;
    border-color: rgb(183 94 160) !important;
}
.type-Stellar {
    background: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/stellar-bg.png")
            center / cover no-repeat,
        url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/stellar-overlay.jpg")
            center 45% / cover no-repeat !important;
    border-color: rgba(0, 0, 0, 0.5) !important;
}
.movebutton.type-Normal small.type::before {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/60px-Frienda-Normal-Type.png");
}
.movebutton.type-Fire small.type::before {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/60px-Frienda-Fire-Type.png");
}
.movebutton.type-Water small.type::before {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/60px-Frienda-Water-Type.png");
}
.movebutton.type-Electric small.type::before {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/60px-Frienda-Electric-Type.png");
}
.movebutton.type-Grass small.type::before {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/60px-Frienda-Grass-Type.png");
}
.movebutton.type-Ice small.type::before {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/60px-Frienda-Ice-Type.png");
}
.movebutton.type-Fighting small.type::before {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/60px-Frienda-Fighting-Type.png");
}
.movebutton.type-Poison small.type::before {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/60px-Frienda-Poison-Type.png");
}
.movebutton.type-Ground small.type::before {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/60px-Frienda-Ground-Type.png");
}
.movebutton.type-Flying small.type::before {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/60px-Frienda-Flying-Type.png");
}
.movebutton.type-Psychic small.type::before {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/60px-Frienda-Psychic-Type.png");
}
.movebutton.type-Bug small.type::before {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/60px-Frienda-Bug-Type.png");
}
.movebutton.type-Rock small.type::before {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/60px-Frienda-Rock-Type.png");
}
.movebutton.type-Ghost small.type::before {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/60px-Frienda-Ghost-Type.png");
}
.movebutton.type-Dragon small.type::before {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/60px-Frienda-Dragon-Type.png");
}
.movebutton.type-Dark small.type::before {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/60px-Frienda-Dark-Type.png");
}
.movebutton.type-Steel small.type::before {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/60px-Frienda-Steel-Type.png");
}
.movebutton.type-Fairy small.type::before {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/60px-Frienda-Fairy-Type.png");
}
.movebutton.type-Stellar small.type::before {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/type-icons/60px-Frienda-Stellar-Type.png");
}
.megaevo-box {
    max-width: 30px;
    right: 25px;
    width: fit-content;
    padding: 0 !important;
    transform: scale(0.9);
    position: absolute !important;
    margin-top: 5px;
    left: 285px !important;
}
.megaevo-box:has(> :only-child) {
    transform: scale(1.03);
    margin-top: 5px;
}
.megaevo-box:has(> :nth-child(2)) {
    transform: scale(0.9);
    margin-top: 0px;
}
.megaevo {
    width: 80px !important;
    margin-bottom: 10px !important;
    height: 80px;
    border: 2px solid rgba(0, 0, 0, 0) !important;
    padding: 6px 6px 2px 6px !important;
    background: rgb(255 255 255 / 8%) !important;
}
.dark .megaevo:hover,
.dark .megaevo:has(input:checked) {
    background: rgb(255 255 255 / 8%) !important;
}
label.megaevo input {
    display: none;
}
label.megaevo {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 0;
    cursor: pointer;
    user-select: none;
}
label.megaevo::before {
    content: "";
    width: 75px;
    height: 75px;
    background: center/contain no-repeat;
    filter: grayscale(100%) brightness(0.5);
    transform: scale(1);
    transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1),
        filter 0.22s ease;
}
label.megaevo:has(input[name="megaevo"])::before {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/Mega-Icon.png");
}
label.megaevo:has(input[name="terastallize"])::before {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/stellar-toggle.png");
    width: 45px !important;
    height: 45px !important;
}
label.megaevo:has(input[name="zmove"])::before {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/Z-power.png");
}
label.megaevo:has(input[name="dynamax"])::before {
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/Dynamax-Icon.png");
}
label.megaevo:hover::before {
    filter: grayscale(30%) brightness(0.4);
    transform: scale(1.06);
}
label.megaevo:active::before {
    transform: scale(0.82);
}
label.megaevo:has(input:checked)::before {
    filter: none;
    animation: optionBounce 0.3s ease;
}
@keyframes optionBounce {
    0% {
        transform: scale(0.82);
    }
    40% {
        transform: scale(1.15);
    }
    65% {
        transform: scale(0.95);
    }
    85% {
        transform: scale(1.05);
    }
    100% {
        transform: scale(1);
    }
}
label.megaevo img {
    width: 80px !important;
    height: auto !important;
    filter: grayscale(100%) brightness(0.5);
    transition: transform 0.22s ease, filter 0.22s ease;
}
label.megaevo:hover img {
    filter: grayscale(30%) brightness(0.4);
    transform: scale(1.05);
}
label.megaevo:active img {
    transform: scale(0.95);
}
label.megaevo:has(input:checked) img {
    filter: none !important;
    transform: scale(1);
}
label.megaevo::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #fff;
    opacity: 0;
    pointer-events: none;
    box-shadow: 0 0 6px #fff, 0 0 12px #55eaff, 0 0 20px #ff4fd8;
}
label.megaevo:has(input:checked)::after {
    animation: sparkleBurst 0.65s cubic-bezier(0.15, 0.8, 0.25, 1),
        sparkleFlash 0.2s ease-out;
}
@keyframes sparkleFlash {
    0% {
        filter: brightness(3);
    }
    100% {
        filter: brightness(1);
    }
}
@keyframes sparkleBurst {
    0% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(0.1);
        box-shadow: 0 0 0 0 #fff, 0 0 0 0 #ff4fd8, 0 0 0 0 #55eaff,
            0 0 0 0 #ffe45c, 0 0 0 0 #8cff66, 0 0 0 0 #a875ff, 0 0 0 0 #ff704d,
            0 0 0 0 #fff;
    }
    25% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(0.5);
        box-shadow: 0 -18px 3px #fff, 13px -13px 3px #ff4fd8, 18px 0 3px #55eaff,
            13px 13px 3px #ffe45c, 0 18px 3px #8cff66, -13px 13px 3px #a875ff,
            -18px 0 3px #ff704d, -13px -13px 3px #fff;
    }
    55% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
        box-shadow: 0 -48px 5px #fff, 34px -34px 5px #ff4fd8, 48px 0 5px #55eaff,
            34px 34px 5px #ffe45c, 0 48px 5px #8cff66, -34px 34px 5px #a875ff,
            -48px 0 5px #ff704d, -34px -34px 5px #fff;
    }
    100% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(1.35);
        box-shadow: 0 -75px 1px transparent, 53px -53px 1px transparent,
            75px 0 1px transparent, 53px 53px 1px transparent,
            0 75px 1px transparent, -53px 53px 1px transparent,
            -75px 0 1px transparent, -53px -53px 1px transparent;
    }
}
.header,
.dark .header {
    margin: 0 6px;
    border-radius: 0 0 6px 6px;
    background: radial-gradient(
        hsla(210, 20%, 10%, 0.6),
        hsla(210, 20%, 10%, 0.7)
    );
    backdrop-filter: blur(35px) saturate(180%);
    border: 1px solid hsla(0, 0%, 60%, 0.15);
    border-top: none;
    height: 55px;
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
}
.maintabbarbottom {
    display: none;
}
.tabbar.maintabbar {
    padding: 0;
    padding-left: 165px;
    right: 155px;
    margin: 0;
    height: 37px;
    top: 9px;
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
}
.tabbar.maintabbar.minitabbar {
    padding-left: 3px;
}
.tabbar a.button span {
    overflow: visible;
}
.userbar .username,
.dark .userbar .username {
    text-shadow: none;
    display: flex;
    align-items: center;
}
.fa-user::before {
    display: none;
}
.logo {
    pointer-events: none;
}
.header .logo {
    margin-left: 12px;
    margin-top: 6px;
}
button {
    font-family: "Lexend", sans-serif !important;
    background-color: hsla(0, 0%, 60%, 0.15);
    border: none;
    border-radius: 6px;
    color: hsl(0, 0%, 100%);
    padding: 4px 8px;
    transition: 0.15s;
}
button:hover,
button:focus-visible {
    background-color: hsla(0, 0%, 60%, 0.3);
}
button:focus {
    outline: transparent;
}
#room-help
    .infobox
    button[style="border: 1px solid black ; border-radius: 30px ; background-color: #eeeeee ; height: 35px"] {
    color: black;
}
.button,
.dark .button {
    font-family: "Lexend", sans-serif !important;
    background-image: none;
    background-color: hsla(0, 0%, 60%, 0.15);
    box-shadow: none;
    text-shadow: none;
    border: none;
    padding: 5px 8px;
    transition: 0.15s;
    outline: transparent;
    color: hsl(0, 0%, 100%);
    border-radius: 6px;
}
.button.big {
    padding: 7px 11px;
}
.button:hover,
.dark .button:hover,
.button:active,
.dark .button:active,
.button:focus-visible,
.dark .button:focus-visible {
    font-family: "Lexend", sans-serif;
    background-image: none;
    background-color: hsla(210, 50%, 50%, 0.6);
    box-shadow: 0 0 10px hsla(210, 50%, 50%, 0.4);
    border: none;
}
.button.disabled,
.dark .button.disabled,
.button.disabled:hover,
.dark .button.disabled:hover,
.button.disabled:active,
.dark .button.disabled:active,
.button:disabled,
.dark .button:disabled,
.button:disabled:hover,
.dark .button:disabled:hover,
.button:disabled:active,
.dark .button:disabled:active {
    font-family: "Lexend", sans-serif;
    background: hsla(0, 0%, 60%, 0.15);
    box-shadow: none;
    color: hsl(0, 0%, 100%);
    opacity: 0.4;
    border: none;
}
select.button {
    appearance: none;
}
.button.notifying,
.dark .button.notifying {
    font-family: "Lexend", sans-serif;
    background: hsla(330, 50%, 50%, 0.4);
}
.button.notifying:hover,
.dark .button.notifying:hover,
.button.notifying:active,
.dark .button.notifying:active,
.button.notifying:focus-visible,
.dark .button.notifying:focus-visible {
    font-family: "Lexend", sans-serif;
    background: hsla(330, 50%, 50%, 0.6);
    box-shadow: 0 0 10px hsla(330, 50%, 50%, 0.4);
}
.tabbar.maintabbar .inner {
    margin-top: -1px;
}
.header .logo {
    margin-left: 12px;
    margin-top: 6px;
}
.userbar {
    top: 15px;
    display: flex;
    gap: 3px;
}
.tabbar a.button.subtle-notifying,
.dark .tabbar a.button.subtle-notifying,
.tablist a.button.subtle-notifying {
    color: hsl(210, 50%, 50%);
}
.tabbar a.button.notifying,
.dark .tabbar a.button.notifying,
.tablist a.button.notifying {
    background: hsla(0, 0%, 60%, 0.15);
    border-color: hsla(210, 50%, 50%, 0.4);
    color: hsl(210, 50%, 50%);
    box-shadow: none;
}
.tabbar a.button.notifying:hover,
.dark .tabbar a.button.notifying:hover,
.tablist a.button.notifying:hover {
    background: hsla(0, 0%, 60%, 0.3);
    border-color: hsl(210, 50%, 50%);
    box-shadow: none;
}
.tabbar a.button,
.dark .tabbar a.button {
    border-radius: 0;
    margin-right: 3px;
    padding: 3px 2px;
    border: 2px solid hsla(0, 0%, 60%, 0.15);
    background: hsla(0, 0%, 60%, 0.15);
    box-shadow: none;
    color: hsl(0, 0%, 100%);
    height: 27px;
    outline: transparent;
}
.tabbar a.button:hover,
.tabbar a.button:active,
.tabbar a.button:focus-visible,
.dark .tabbar a.button:hover,
.dark .tabbar a.button:active {
    background: hsla(0, 0%, 60%, 0.3);
    box-shadow: none;
    border-color: hsla(0, 0%, 60%, 0.3);
}
.tabbar a.button.cur,
.tabbar a.button.cur:hover,
.dark .tabbar a.button.cur,
.dark .tabbar a.button.cur:hover {
    top: 1px;
    padding: 3px 2px;
    background: hsla(210, 50%, 50%, 0.4);
    color: hsl(0, 0%, 100%);
    box-shadow: none;
    border: 2px solid hsla(210, 50%, 50%, 0.4);
}
.tabbar a.button.cur:focus-visible,
.tabbar a.button.cur:focus-visible:hover {
    background: hsl(210, 50%, 50%);
}
.tabbar a.button i.text + span {
    margin-right: 0;
}
.tabbar li:first-child a.button {
    border-top-left-radius: 6px;
    border-bottom-left-radius: 6px;
}
.tabbar li:last-child a.button {
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
}
.closebutton {
    transition: 0.15s;
}
.tabbar a + .closebutton {
    opacity: 0;
    transition: 0.15s;
}
.tabbar a.cur + .closebutton,
.tabbar a:hover + .closebutton,
.tabbar a + .closebutton:hover,
.tabbar a + .closebutton:active,
.tabbar a + .closebutton:focus-visible {
    opacity: 1;
}
.tabbar a.cur + .closebutton {
    top: 3px;
}
.tabbar .closebutton {
    margin: 0 0 0 -20px;
    width: 20px;
}
.maintabbar .overflow .button {
    background: hsl(210, 40%, 25%);
    border-radius: 6px;
}
.maintabbar .overflow .button:hover,
.maintabbar .overflow .button:active,
.maintabbar .overflow .button:focus-visible {
    background: hsl(210, 40%, 20%);
    box-shadow: none;
}
.tabbar a.button.minilogo {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
}
.minilogo img {
    margin-top: -2px;
}
.tablist .button.cur,
.tablist .button.cur:hover {
    background: hsla(210, 50%, 50%, 0.4);
    color: hsl(0, 0%, 100%);
    box-shadow: none;
    border: 2px solid hsla(210, 50%, 50%, 0.4);
}
.tablist .button {
    border: 2px solid hsla(0, 0%, 60%, 0.15);
    margin-bottom: 3px;
    box-shadow: none;
    border-radius: 0;
}
.tablist .button:hover {
    background: hsla(0, 0%, 60%, 0.3);
    border: 2px solid hsla(0, 0%, 60%, 0.3);
    box-shadow: none;
}
.tablist li:first-of-type .button {
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
}
.tablist li:last-of-type .button {
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
}
.tablist .closebutton {
    margin-top: -33px;
}
.ps-room {
    transition: 0.3s;
}
.ps-overlay,
.dark .ps-overlay {
    background: none;
}
.ps-overlay::before {
    background-color: hsla(0, 0%, 0%, 0.5);
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    right: 0;
    animation: blur-in 0.3s;
    backdrop-filter: blur(5px);
}
@keyframes blur-in {
    from {
        opacity: 0;
        backdrop-filter: none;
    }
    to {
        opacity: 1;
        backdrop-filter: blur(5px);
    }
}
.blocklink,
.dark .blocklink {
    background: hsla(0, 0%, 60%, 0.15);
    color: hsl(0, 0%, 100%);
    text-shadow: none;
    border: 2px solid transparent;
    transition: 0.15s;
    padding: 2px 5px;
    border-radius: 6px;
}
.blocklink:hover,
.dark .blocklink:hover,
.blocklink:focus-visible {
    background: hsla(210, 50%, 50%, 0.4);
    color: hsl(0, 0%, 100%);
    border: 2px solid hsla(210, 50%, 50%, 0.4);
    outline: transparent;
}
.blocklink,
.dark .blocklink {
    background: hsla(0, 0%, 60%, 0.15);
    color: hsl(0, 0%, 100%);
    text-shadow: none;
    border: 2px solid transparent;
    transition: 0.15s;
    padding: 2px 5px;
    border-radius: 6px;
}
.blocklink:hover,
.dark .blocklink:hover,
.blocklink:focus-visible {
    background: hsla(210, 50%, 50%, 0.4);
    color: hsl(0, 0%, 100%);
    border: 2px solid hsla(210, 50%, 50%, 0.4);
    outline: transparent;
}
@keyframes fade-in {
    from {
        opacity: 0.4;
    }
    to {
        opacity: 1;
    }
}
.pm-window,
.menugroup,
.ps-room:not(#room-) {
    animation: fade-in 0.3s;
}
.ps-room {
    transition: 0.3s;
}
.select,
.team,
.dark .select,
.dark .team {
    background: hsla(0, 0%, 60%, 0.15);
    color: hsl(0, 0%, 100%);
    border: none;
    box-shadow: none;
    transition: 0.15s;
    border-radius: 6px;
}
.select:hover,
.team:hover,
.dark .select:hover,
.dark .team:hover,
.select:active,
.team:active,
.dark .select:active,
.dark .team:active,
.select:focus-visible,
.team:focus-visible,
.dark .select:hover,
.dark .select:hover .team,
.dark a.team:hover,
.dark button.team:hover {
    background: hsla(210, 50%, 50%, 0.6);
    color: hsl(0, 0%, 100%);
    box-shadow: 0 0 10px hsla(210, 50%, 50%, 0.4);
}
.select:after,
.dark .select:after,
.select:disabled:after,
.dark .select:disabled:after,
.teamselect:disabled strong,
.dark .teamselect:disabled strong {
    color: hsl(0, 0%, 100%);
}
.select:disabled,
.dark .select:disabled,
.select:disabled.preselected {
    background: hsla(0, 0%, 60%, 0.15);
    color: hsl(0, 0%, 100%);
    opacity: 0.4;
    box-shadow: none;
}
.team,
.dark .team {
    border-radius: 6px;
    margin-bottom: 2px;
}
.subrooms {
    padding-top: 5px;
    display: flex;
    align-items: center;
    gap: 3px;
    flex-wrap: wrap;
}
.roomlist .blocklink:not(.menugroup .blocklink) {
    margin-left: 0;
}
.ps-popup .userdetails .rooms span {
    display: inline-block !important;
    max-width: 55% !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    vertical-align: middle !important;
}
a,
.dark a,
a.ilink,
.dark a.ilink {
    color: #e6ce5f;
    outline: 2px solid transparent;
}
a:not(.button, .blocklink):visited,
.dark a:not(.button, .blocklink):visited,
a.ilink.yours,
a.ilink:hover {
    color: hsl(210, 20%, 50%);
}
a:focus-visible {
    outline: 2px solid currentColor;
    border-radius: 2px;
    transition: outline 0.15s;
}
a.subtle,
button.subtle,
.dark button.subtle {
    color: hsl(0, 0%, 100%);
    background: none;
    transition: 0.15s;
}
a.subtle:hover,
button.subtle:hover,
a.subtle:focus-visible,
button.subtle:focus-visible {
    color: hsl(210, 50%, 50%);
    text-decoration: none;
    outline: transparent;
}
.option,
.dark .option {
    color: hsl(0, 0%, 100%);
    border-radius: 6px;
}
.option:hover,
.dark .option:hover,
.option:focus-visible {
    background-color: hsla(0, 0%, 60%, 0.15);
    border-color: hsla(210, 50%, 50%, 0.4);
}
.option.cur,
.dark .option.cur {
    background-color: hsla(0, 0%, 60%, 0.15);
    border-color: hsla(210, 50%, 50%, 0.4);
}
.option.cur:hover,
.dark .option.cur:hover,
.option.cur:focus-visible {
    background-color: hsla(0, 0%, 60%, 0.3);
    border-color: hsla(210, 50%, 50%, 0.6);
}
.popupmenu .option {
    border: none;
    color: hsl(0, 0%, 100%);
    border-radius: 0 6px 6px 0;
    border-left: 2px solid transparent;
    display: flex;
    align-items: center;
    margin-top: 2px;
}
.popupmenu .option:not([name="moveHere"]) {
    justify-content: space-between;
}
.popupmenu .option:hover,
.popupmenu .option.cur {
    border-color: hsla(210, 50%, 50%, 0.4);
}
.avatarlist .option {
    border: none;
}
.formlist .option {
    border: none;
}
.bglist .option {
    text-align: center;
    border: none;
    padding: 4px;
}
.bglist button span,
.bglist .option strong {
    border-radius: inherit;
}
.bglist button span {
    background-image: var(--bg-selector) !important;
}
.bglist
    .option
    strong[style="background:#888888;color:white;padding:16px 18px;display:block;font-size:12pt"] {
    background: hsla(210, 50%, 50%, 0.4) !important;
}
.ps-popup[style*="max-width: 448px; position: absolute; margin: 0px;"] {
    max-width: 455px !important;
}
.bgstatus
    strong[style="background:red;color:white;padding:1px 4px;border-radius:4px;display:block"] {
    background: hsl(330, 50%, 50%) !important;
    border-radius: 6px !important;
}
.menugroup {
    background: radial-gradient(
        hsla(210, 20%, 10%, 0.6),
        hsla(210, 20%, 10%, 0.7)
    );
    backdrop-filter: blur(35px) saturate(180%);
    border: 1px solid hsla(0, 0%, 60%, 0.15);
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
    border-radius: 6px;
    text-shadow: none;
    color: hsl(0, 0%, 100%);
}
.mainmenufooter {
    display: none;
}
@media (max-width: 895px) {
    .rightmenu {
        padding-bottom: 0;
    }
}
.tiny-layout .rightmenu,
.mainmenu {
    padding-bottom: 0;
}
.leftmenu,
.tiny-layout .leftmenu {
    padding-top: 6px;
}
.menugroup {
    margin: 0 6px 6px 6px;
}
.tiny-layout .menugroup {
    margin: 0 auto 6px;
}
.activitymenu {
    left: 284px;
    top: 6px;
}
.pm-window {
    margin: 0 -24px 6px 0;
}
.tiny-layout .pm-window {
    margin: 0 -1px 6px -1px;
}
.tiny-layout .activitymenu {
    padding-bottom: 0;
}
.rightmenu {
    top: 6px;
}
.rightmenu {
    top: 6px;
    width: 270px;
    right: 6px;
}
.rightmenu > .menugroup {
    margin: 0px;
}
.pm-window,
.dark .pm-window {
    border-radius: 6px;
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
    background: radial-gradient(
        hsla(210, 20%, 10%, 0.6),
        hsla(210, 20%, 10%, 0.7)
    );
    backdrop-filter: blur(35px) saturate(180%);
}
.pm-window h3,
.dark .pm-window h3 {
    background: none;
    color: hsl(0, 0%, 60%);
    border: 1px solid hsla(0, 0%, 60%, 0.15);
    border-radius: 6px 6px 0 0;
}
.pm-window h3 small {
    color: hsl(0, 0%, 60%);
}
.pm-window h3.pm-minimized {
    border-radius: 6px;
}
.pm-window h3,
.minimizebutton,
.closebutton {
    transition: color 0.15s;
}
.minimizebutton:hover,
.closebutton:hover,
.minimizebutton:focus-visible,
.closebutton:focus-visible {
    background: none;
}
.pm-window h3:hover,
.dark .pm-window h3:hover {
    color: hsl(0, 0%, 100%);
}
.pm-window h3.pm-notifying,
.dark .pm-window h3.pm-notifying {
    border-color: hsla(0, 0%, 60%, 0.15);
    background: none;
    box-shadow: inset 0 0 0 500px hsla(210, 50%, 50%, 0.4);
}
.pm-window h3.pm-notifying:hover,
.dark .pm-window h3.pm-notifying:hover {
    border-color: hsla(0, 0%, 60%, 0.15);
    background: none;
}
.header-username,
.closebutton,
.minimizebutton,
.dark .closebutton,
.dark .minimizebutton {
    color: hsl(0, 0%, 60%);
}
.minimizebutton:hover,
.pm-window h3:hover .minimizebutton,
.dark .minimizebutton:hover,
.dark .pm-window h3:hover .minimizebutton {
    color: hsl(0, 0%, 100%);
}
.pm-window h3 .closebutton:hover + .minimizebutton {
    color: hsl(0, 0%, 60%) !important;
}
.closebutton:hover,
.dark .closebutton:hover,
.closebutton:active,
.closebutton:focus-visible {
    color: hsl(210, 50%, 50%);
    outline: transparent;
}
.minimizebutton:active {
    color: hsl(0, 0%, 100%);
}
.pm-window.focused h3,
.pm-window.focused h3:hover,
.dark .pm-window.focused h3,
.dark .pm-window.focused h3:hover {
    background: none;
    color: hsl(0, 0%, 100%);
}
.pm-window.focused h3,
.pm-window.focused .pm-log,
.pm-window.focused .pm-log-add,
.dark .pm-window.focused h3,
.dark .pm-window.focused .pm-log,
.dark .pm-window.focused .pm-log-add {
    border-color: hsla(0, 0%, 60%, 0.15);
}
.pm-log,
.dark .pm-log {
    color: hsl(0, 0%, 100%);
    background: none;
    border-color: hsla(0, 0%, 60%, 0.15);
    backdrop-filter: none;
}
.news-embed .pm-log {
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
}
.newsentry,
.dark .newsentry {
    border-bottom: 1px solid hsla(0, 0%, 60%, 0.15);
}
.newsentry:last-child {
    border-radius: inherit;
}
.unread {
    background: none;
    box-shadow: inset 0 0 0 500px hsla(210, 50%, 50%, 0.4);
}
.pm-log-add,
.dark .pm-log-add {
    background: none;
    border-color: hsla(0, 0%, 60%, 0.15);
    padding: 4px 4px 4px 0px;
}
.pm-buttonbar button,
.dark .pm-buttonbar button {
    background: none;
    border: none;
    color: hsl(0, 0%, 60%);
    transition: 0.15s;
}
.pm-buttonbar button:hover,
.dark .pm-buttonbar button:hover {
    background: none;
    color: hsl(0, 0%, 100%);
}
.challenge {
    background: none;
    border-color: hsla(0, 0%, 60%, 0.15);
    border-top: none;
    color: hsl(0, 0%, 100%);
    margin-top: 0;
}
.pm-minimized + .challenge {
    display: none;
}
div[style="max-height: 222px ; overflow-y: auto ; color: #fff ; text-shadow: 1px 0 0 #000 , 0 -1px 0 #000 , 0 1px 0 #000 , -1px 0 0 #000"] {
    text-shadow: none !important;
    color: hsl(0, 0%, 100%) !important;
}
table[style="border-collapse: collapse ; border: 1px solid #6688aa ; background-color: rgba(40 , 40 , 60 , 1) ; border-radius: 10px"] {
    background: none !important;
    border-radius: 0 !important;
    border-color: hsl(0, 0%, 60%) !important;
}
th[style="border-bottom: 1px solid #94b8b8 ; padding: 5px"] {
    border-color: hsl(0, 0%, 60%);
}
tr[style="width: auto ; background: rgb(35 , 35 , 100) ; background-attachment: fixed ; font-size: 14px"] {
    background: hsla(210, 50%, 50%, 0.4) !important;
}
tr[style="width: auto ; background: rgb(80 , 80 , 110) ; background-attachment: fixed ; font-size: 14px"] {
    background: hsla(330, 50%, 50%, 0.4) !important;
}
.ladder table,
.ladder td,
.ladder th {
    border-color: hsl(0, 0%, 60%);
}
.ladder th {
    background: hsla(0, 0%, 60%, 0.3);
    color: hsl(0, 0%, 100%);
}
.ladder span {
    color: hsl(0, 0%, 60%);
}
.ps-popup,
.dark .ps-popup {
    color: hsl(0, 0%, 100%);
    background: radial-gradient(
        hsla(210, 20%, 10%, 0.6),
        hsla(210, 20%, 10%, 0.7)
    );
    backdrop-filter: blur(35px) saturate(180%);
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
    border-color: hsla(0, 0%, 60%, 0.15);
    border-radius: 6px;
    animation: fade-in-from-top 0.3s;
    max-height: 90vh;
    overflow-y: auto;
    z-index: 30;
}
.ps-popup.tournament-popout-bracket {
    overflow-y: hidden;
}
@keyframes pop-in {
    from {
        opacity: 0.4;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}
@keyframes fade-in-from-top {
    from {
        opacity: 0.4;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0px);
    }
}
@keyframes fade-in-from-left {
    from {
        opacity: 0.4;
        transform: translateX(-10px);
    }
    to {
        opacity: 1;
        transform: translateX(0px);
    }
}
.ps-overlay {
    display: flex;
    flex-wrap: wrap;
    align-content: center;
    justify-content: center;
    z-index: 30;
}
.ps-overlay .ps-popup {
    max-height: 80vh;
    margin: 0;
}
.popupmenu strong,
.popupmenu h3 {
    color: hsl(210, 50%, 50%) !important;
}
.popupmenu i {
    color: hsl(210, 50%, 50%) !important;
    text-shadow: none !important;
}
i.subtle {
    color: hsla(0, 0%, 60%, 0.15) !important;
    opacity: 1 !important;
    transition: 0.15s;
}
i.subtle:hover {
    color: hsla(210, 50%, 50%, 0.4) !important;
    opacity: 1 !important;
}
.ps-popup > .popupmenu:nth-child(2) {
    margin-top: 5px;
    margin-bottom: 7px;
}
.usergroup,
.dark .usergroup {
    color: hsl(0, 0%, 60%);
}
.ps-popup p.error {
    color: hsl(330, 50%, 50%);
}
.userdetails .offline {
    color: hsl(330, 50%, 50%);
}
.roomgroup span[style="color:#777777"] {
    color: hsl(0, 0%, 60%) !important;
}
.folderpane {
    border: none;
    padding-left: 5px;
    background: none;
    width: 152px;
    border-right: 1px solid hsla(0, 0%, 60%, 0.15);
}
.folderlistafter:before,
.folderlistbefore:before,
.folderpane h3,
.folder .selectFolder,
.folderlist .foldersep:before,
.folderhack1,
.folderhack2,
.dark .folderlistafter:before,
.dark .folderlistbefore:before,
.dark .folderpane h3,
.dark .folder .selectFolder,
.dark .folderlist .foldersep:before,
.dark .folderhack1,
.dark .folderhack2 {
    background: none;
    color: hsl(0, 0%, 100%);
}
.folderlistafter:before,
.folderlistbefore:before,
.folderpane h3,
.folderlist .foldersep:before {
    border: none;
}
.folder.cur .selectFolder,
.folder.cur .selectFolder:hover,
.folder.cur .selectFolder:active {
    border-color: transparent;
    border-radius: 6px;
}
.folderlistbefore {
    height: 5px;
}
.folderlist .folder {
    height: 37px;
}
.folderpane h3 {
    padding-top: 13px;
    height: auto;
}
.folderlist .foldersep:before {
    display: block;
    height: 13px;
}
.folder .selectFolder,
.dark .folder .selectFolder {
    margin-right: 5px;
    border-radius: 6px;
    transition: 0.15s;
    color: hsl(0, 0%, 100%);
    border: 2px solid transparent;
    padding-top: 0;
    padding-left: 7px;
    height: 35px;
    box-sizing: border-box;
    display: grid;
    align-items: center;
    grid-template-columns: 16px auto;
}
.folder .selectFolder:hover,
.folder .selectFolder:active,
.dark .folder .selectFolder:hover,
.dark .folder .selectFolder:active,
.folder .selectFolder:focus-visible {
    background: hsla(0, 0%, 60%, 0.3);
    outline: transparent;
}
.folder.cur .selectFolder,
.folder.cur .selectFolder:hover,
.folder.cur .selectFolder:active,
.dark .folder.cur .selectFolder,
.dark .folder.cur .selectFolder:hover,
.dark .folder.cur .selectFolder:active {
    background: hsla(210, 50%, 50%, 0.4);
    color: hsl(0, 0%, 100%);
    border: 2px solid hsla(210, 50%, 50%, 0.4);
    padding-top: 0px;
    padding-left: 7px;
    height: 35px;
}
.folderpane i,
.dark .folderpane i {
    color: hsl(0, 0%, 100%);
}
.selectFolder a,
.dark .selectFolder a,
.selectFolder a:visited,
.dark .selectFolder a:visited {
    color: hsl(210, 50%, 50%);
}
.setchart-nickname,
.dark .setchart-nickname {
    border: 2px solid transparent;
    background: hsl(210, 40%, 25%);
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
    height: 36px;
    padding: 2px;
    border-radius: 6px;
    width: 104px;
}
.setchart-nickname input {
    width: 95px;
    margin: 0;
    border: none;
    padding: 1px 4px;
}
.setcol-icon {
    margin-left: 2px;
    margin-right: 3px;
}
.setcol-details {
    margin-right: 3px;
}
.setcol-moves {
    margin-right: 3px;
}
.setchart,
.dark .setchart {
    border-color: transparent;
    background-color: hsl(210, 40%, 25%);
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
    height: 125px;
    border-radius: 6px;
    width: 640px;
}
.teamchart {
    padding-left: 10px;
}
.exportbutton {
    margin-left: 10px;
}
.setchart input {
    height: 22px;
    border: none;
    padding: 1px 4px;
    box-sizing: border-box;
    margin: 0;
}
.setchart .setcol-moves input {
    width: 132px;
}
.setcol-moves .setcell {
    padding-bottom: 6px;
}
.setcell-ability {
    padding-right: 4px;
}
.setcell-ability input {
    width: 112px;
}
.setcell-pokemon input {
    width: 108px;
}
.ps-room .setchart .textbox,
.dark .setchart .textbox,
.ps-room .setchart-nickname .textbox,
.dark .setchart-nickname .textbox {
    background: hsl(210, 40%, 20%);
    box-shadow: inset 0 2px 3px hsla(0, 0%, 0%, 0.1);
}
.ps-room .setchart .textbox:hover,
.dark .setchart .textbox:hover,
.ps-room .setchart-nickname .textbox:hover,
.dark .setchart-nickname .textbox:hover {
    background: hsl(210, 40%, 15%);
    box-shadow: inset 0 2px 3px hsla(0, 0%, 0%, 0.1);
}
.ps-room .setchart .textbox:focus,
.dark .setchart .textbox:focus,
.ps-room .setchart-nickname .textbox:focus,
.dark .setchart-nickname .textbox:focus {
    background: hsl(210, 40%, 15%);
    animation: shift-solid 1.5s infinite;
    box-shadow: inset 0 2px 3px hsla(0, 0%, 0%, 0.1);
}
@keyframes shift-solid {
    0% {
        background: hsl(210, 40%, 15%);
    }
    50% {
        background: hsl(210, 40%, 20%);
    }
    100% {
        background: hsl(210, 40%, 15%);
    }
}
.setchart .textbox:disabled:hover,
.dark .setchart .textbox:disabled:hover,
.setchart-nickname .textbox:disabled:hover,
.dark .setchart-nickname .textbox:disabled:hover {
    background: hsl(210, 40%, 20%);
}
.setdetails,
.setstats {
    margin: 0;
    border: none;
}
.setstats {
    height: 106px;
}
.setdetails:active,
.setstats:active,
.setchart .textbox.setdetails:focus,
.setchart .textbox.setstats:focus,
.dark .setdetails:focus,
.dark .setstats:focus {
    border: none;
    margin: 0;
    animation: none;
}
.setdetails:focus,
.setdetails:active {
    width: 230px;
    height: 34px;
}
.setstats:focus,
.setstats:active {
    width: 138px;
    height: 106px;
}
.setdetails .detailcell {
    border: none;
    font-size: 8pt;
}
.setstats .statgraph span {
    border-radius: 2px;
}
.setstats .statgraph span {
    filter: brightness(90%) saturate(350%);
}
.setchart label,
.setchart-nickname label,
.setchart .statrow-head em,
.dark .setchart label,
.dark .setchart-nickname label,
.dark .setchart .statrow-head em {
    color: hsl(0, 0%, 100%);
}
.setcol-icon label,
.dark .setcol-icon label {
    text-shadow: hsl(210, 40%, 25%) 1px 1px 0, hsl(210, 40%, 25%) 1px -1px 0,
        hsl(210, 40%, 25%) -1px 1px 0, hsl(210, 40%, 25%) -1px -1px 0;
}
.setchart label,
.setchart-nickname label {
    padding: 0;
    padding-bottom: 2px;
    height: 12px;
}
.setcol-details .itemicon {
    opacity: 1;
}
.setchart input.incomplete {
    color: hsl(210, 50%, 50%);
    border-color: transparent;
}
.changeform i,
.dark .changeform i {
    background: none;
    border: none;
    color: hsl(0, 0%, 100%);
    box-shadow: none;
    margin-left: 88px;
}
.resultheader {
    margin-left: 10px;
    margin-right: 10px;
    margin-top: 5px;
    position: relative;
    padding: 0;
}
.utilichart h3,
.dexentry h3,
.resultheader h3,
.dark .utilichart h3,
.dark .dexentry h3,
.dark .resultheader h3 {
    font-family: "Lexend", sans-serif !important;
    color: hsl(0, 0%, 100%);
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
    text-shadow: none;
    background: hsl(210, 40%, 25%);
    border: 2px solid transparent;
    border-radius: 6px;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    inset: 0;
    width: 685px;
    box-sizing: border-box;
}
.teambuilder-results .resultheader h3 {
    border-right: 2px solid transparent;
}
.teambuilder-results li.result {
    margin-left: 10px;
    margin-right: 10px;
    margin-top: 5px;
    padding: 0;
    position: relative;
    width: 685px;
}
.utilichart li > a {
    margin: 0;
}
.teambuilder-results .utilichart li > *:not(strong) {
    position: absolute;
    inset: 0;
}
@media (max-height: 410px) {
    .teambuilder-results,
    .dark .teambuilder-results {
        background: none;
        color: hsl(0, 0%, 100%);
    }
}
@media (max-width: 639px) {
    .teambuilder-results,
    .dark .teambuilder-results {
        background: none;
        color: hsl(0, 0%, 100%);
    }
}
.utilichart .sortrow {
    border: none;
    border-radius: 6px;
    background: hsl(210, 40%, 25%);
    height: 100%;
    width: 685px;
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
}
.utilichart .sortcol {
    color: hsl(0, 0%, 100%);
    transition: 0.15s;
    border-radius: 4px;
    height: 25px;
    margin: 3px 3px 0px 3px;
}
.utilichart .sortcol.cur,
.utilichart .sortcol:hover,
.utilichart .sortcol:focus-visible,
.utilichart .sortcol.numsortcol.cur,
.utilichart .sortcol.numsortcol.cur:hover {
    background: hsl(210, 40%, 20%);
    outline: transparent;
}
.utilichart .sortcol.cur:focus-visible {
    background: hsl(210, 40%, 15%);
}
.utilichart .movenamesortcol,
.utilichart .sortcol.numsortcol {
    border-radius: 6px 0 0 6px;
}
.utilichart .statsortcol {
    text-align: center;
    margin: 3px 0.5px 0px 0.5px;
    font-size: 9px;
}
.utilichart .statsortcol:hover {
    text-align: center;
    margin: 3px 0.5px 0px 0.5px;
}
.utilichart .movenamesortcol {
    width: 147px;
}
.utilichart .numsortcol {
    width: 50px;
}
.utilichart .abilitysortcol {
    width: 172px;
}
.utilichart .accuracysortcol {
    width: 37px;
}
.utilichart .movetypesortcol[data-sort="type"] {
    width: 75px !important;
    text-align: center;
}
.utilichart .movetypesortcol[data-sort="category"] {
    width: 40px !important;
    text-align: center;
}
.typecol img[alt="Status"],
.typecol img[alt="Physical"],
.typecol img[alt="Special"] {
    margin-left: 21px;
}
.chat .typecol img[alt="Status"],
.chat .typecol img[alt="Physical"],
.chat .typecol img[alt="Special"] {
    margin-left: 0px;
}
.typecol:has(
        img:nth-of-type(2)[alt="Status"],
        img:nth-of-type(2)[alt="Physical"],
        img:nth-of-type(2)[alt="Special"]
    )
    img:nth-of-type(1) {
    margin-left: 7px;
}
.utilichart .typesortcol {
    width: 130px;
    text-align: center;
}
.teambuilder-results .result a {
    border-radius: 6px;
    transition: 0.15s;
}
.teambuilder-results .result a.cur,
.dark .teambuilder-results .result a.cur {
    border-color: hsla(0, 0%, 60%, 0.15);
    background: hsla(0, 0%, 60%, 0.15);
}
.teambuilder-results .result a:hover,
.teambuilder-results .result a.hover,
.teambuilder-results .result a.cur:hover,
.teambuilder-results .result a.cur.hover,
.dark .teambuilder-results .result a:hover,
.dark .teambuilder-results .result a.hover,
.dark .teambuilder-results .result a.cur:hover {
    background: hsla(0, 0%, 60%, 0.3);
    border-color: hsla(0, 0%, 60%, 0.3);
}
.utilichart .movenamecol,
.utilichart .col,
.dark .utilichart .col,
.dark .utilichart .cur .col,
.dark .utilichart a:hover .col {
    color: hsl(0, 0%, 100%);
}
.utilichart .labelcol em,
.utilichart .widelabelcol em,
.utilichart .pplabelcol em,
.utilichart .statcol em,
.utilichart .bstcol em {
    color: hsl(0, 0%, 60%);
}
.utilichart .typecol img {
    opacity: 1;
}
.utilichart b {
    color: hsl(210, 50%, 50%);
}
.utilichart .illegalcol em {
    color: hsl(0, 100%, 67%);
    border-color: transparent;
    border-radius: 6px;
    background: hsla(0, 50%, 50%, 0.2);
}
.utilichart .filtercol em {
    color: hsl(205, 50%, 50%);
    border-color: transparent;
    border-radius: 6px;
    background: hsla(205, 50%, 50%, 0.2);
}
.teambuilder-results .utilichart .typecol {
    width: 130px;
}
.teambuilder-results .utilichart .typecol > img {
    margin-right: 5px;
}
.utilichart .filter,
.searchboxwrapper .filter {
    border-color: hsla(0, 0%, 60%, 0.15);
    background: hsla(0, 0%, 60%, 0.15);
    color: hsl(0, 0%, 100%);
    transition: 0.15s;
    border-radius: 6px;
}
.utilichart .filter:hover,
.searchboxwrapper .filter:hover,
.utilichart .filter:focus-visible,
.searchboxwrapper .filter:focus-visible {
    color: hsl(0, 0%, 100%);
    opacity: 0.4;
    text-decoration: none;
}
.utilichart .filter i,
.searchboxwrapper .filter i {
    transition: 0.15s;
}
.utilichart .filter:hover i,
.searchboxwrapper .filter:hover i,
.utilichart .filter:focus-visible i,
.searchboxwrapper .filter:focus-visible i {
    color: hsl(210, 50%, 50%);
}
small[style="color: #888"] {
    color: hsl(0, 0%, 60%) !important;
}
.teambuilder-clipboard-container {
    border: none;
    background: hsla(0, 0%, 60%, 0.15);
    margin: 0;
    height: 62px;
    width: 456px;
}
.teambuilder-clipboard-title {
    display: none;
}
.teambuilder-clipboard-buttons {
    width: auto;
    right: auto;
    display: flex;
}
.teambuilder-clipboard-button-left {
    margin-right: 4px;
}
.teambuilder-clipboard-button-left,
.teambuilder-clipboard-button-right {
    height: auto;
}
.teambuilder-clipboard-data,
.dark .teambuilder-clipboard-data {
    right: auto;
    border: none;
    background: hsl(210, 40%, 25%);
    color: hsl(0, 0%, 100%);
    transition: 0.15s;
    border-radius: 6px;
}
.teambuilder-clipboard-data:hover {
    background: hsl(210, 40%, 20%);
    border: none;
}
.teambuilder-clipboard-data .section {
    border: none;
}
.setmenu button,
.teamlist button,
.dark .setmenu button,
.dark .teamlist button,
.setmenu button[name="undeleteSet"] {
    border: none;
    padding: 3px 6px;
    color: hsl(0, 0%, 100%);
    border-radius: 6px;
    background: none;
}
.setmenu button:hover,
.teamlist button:hover,
.dark .setmenu button:hover,
.dark .teamlist button:hover,
.dark .setmenu button:focus-visible,
.dark .teamlist button:focus-visible,
.setmenu button[name="undeleteSet"]:hover,
.setmenu button[name="undeleteSet"]:focus-visible {
    background: hsla(0, 0%, 60%, 0.15);
    box-shadow: none;
}
.teamlist button {
    margin-left: 2px;
}
.setmenu button {
    font-size: 0 !important;
    width: 32px !important;
    min-width: 32px !important;
    height: 32px !important;
    padding: 0 !important;
    text-align: center !important;
}
.setmenu button i {
    display: none !important;
}
.setmenu button[name="copySet"]::before,
.setmenu button[name="importSet"]::before,
.setmenu button[name="moveSet"]::before,
.setmenu button[name="deleteSet"]::before {
    content: "";
    display: inline-block;
    width: 18px;
    height: 18px;
    background-color: currentColor;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-position: center;
    mask-position: center;
    -webkit-mask-size: contain;
    mask-size: contain;
}
button[name="copySet"]::before {
    -webkit-mask-image: var(--icon-copy);
    mask-image: var(--icon-copy);
}
button[name="importSet"]::before {
    -webkit-mask-image: var(--icon-import);
    mask-image: var(--icon-import);
}
button[name="moveSet"]::before {
    -webkit-mask-image: var(--icon-move);
    mask-image: var(--icon-move);
}
button[name="deleteSet"]::before {
    -webkit-mask-image: var(--icon-delete);
    mask-image: var(--icon-delete);
}
button[name="edit"],
button[name="duplicate"],
button[name="delete"] {
    font-size: 0 !important;
    width: 32px !important;
    min-width: 32px !important;
    height: 32px !important;
    padding: 0 !important;
    transition: transform 0.15s ease !important;
    text-align: center !important;
}
button[name="edit"] > i,
button[name="duplicate"] > i,
button[name="delete"] > i:hover {
    display: none !important;
}
button[name="copySet"]:hover,
button[name="importSet"]:hover,
button[name="moveSet"]:hover,
button[name="deleteSet"]:hover,
button[name="edit"]:hover,
button[name="duplicate"]:hover,
button[name="delete"]:hover {
    background: transparent !important;
    background-image: none !important;
    box-shadow: none !important;
    transform: scale(1.2) !important;
}
button[name="edit"]::before,
button[name="duplicate"]::before,
button[name="delete"]::before {
    content: "" !important;
    display: inline-block !important;
    width: 20px !important;
    height: 20px !important;
    background-color: currentColor !important;
    -webkit-mask-repeat: no-repeat !important;
    mask-repeat: no-repeat !important;
    -webkit-mask-position: center !important;
    mask-position: center !important;
    -webkit-mask-size: contain !important;
    mask-size: contain !important;
    vertical-align: middle !important;
    position: relative !important;
    top: -7px;
}
button[name="edit"]::before {
    -webkit-mask-image: var(--icon-edit) !important;
    mask-image: var(--icon-edit) !important;
}
button[name="duplicate"]::before {
    -webkit-mask-image: var(--icon-copy) !important;
    mask-image: var(--icon-copy) !important;
}
button[name="delete"]::before {
    -webkit-mask-image: var(--icon-delete) !important;
    mask-image: var(--icon-delete) !important;
}
button[name="edit"] {
    margin-left: 15px;
}
.setmenu {
    align-items: flex-start;
    flex-direction: column;
    display: flex;
    top: 29px;
    left: 650px;
}
.setmenu button:disabled,
.setmenu button:disabled:hover {
    opacity: 0.4;
    background: none;
}
.setcell-typeicons img {
    margin-left: 5px;
}
.teampane p {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    align-items: center;
}
.teampane p .textbox {
    height: 15px;
}
.teampane .menugroup p {
    display: block;
}
.teamwrapper .pad {
    display: flex;
    gap: 5px;
    margin-top: 5px;
}
.teamchartbox {
    border-color: hsla(0, 0%, 60%, 0.15);
    overflow: initial;
}
.teambar button,
.dark .teambar button {
    background: none;
    border-radius: 0;
    border: none;
    border-bottom: 2px solid transparent;
    height: 50px;
    margin-right: 2px;
    transform: translateY(4px);
}
.teambar button:hover,
.dark .teambar button:hover,
.teambar button:focus-visible {
    background: none;
    border: none;
    border-bottom: 2px solid hsla(210, 50%, 50%, 0.4);
    height: 50px;
    transform: translateY(0px);
}
.teambar button:disabled,
.teambar button:disabled:hover,
.teambar button:disabled:active,
.dark .teambar button:disabled,
.dark .teambar button:disabled:hover,
.dark .teambar button:disabled:active {
    background: none;
    border-color: hsl(210, 50%, 50%);
    opacity: 1;
    transform: translateY(0px);
}
.teamchartbox.individual {
    margin-top: 7px;
    padding-top: 4px;
}
.teambuilder-results {
    margin-top: 8px;
}
.teambuilder-pokemon-import {
    padding: 0;
}
.teampane > h2:nth-child(2),
.teampane > p:nth-child(3),
.teampane > p:nth-child(4) {
    display: none;
}
.timerbutton.timerbutton-on {
    color: hsl(0, 0%, 100%);
    font-weight: bold;
    background: hsla(330, 50%, 50%, 0.4);
}
.timerbutton.timerbutton-on:hover {
    box-shadow: 0 0 10px hsla(330, 50%, 50%, 0.4);
    background: hsla(330, 50%, 50%, 0.6);
    color: hsl(0, 0%, 100%);
}
.teambar {
    overflow: hidden;
}
.teambar:focus-within {
    bottom: 0;
}
.statform .graphcol div span {
    border-radius: 2px;
    border: none;
    margin-top: 4px;
}
.statform input.numform {
    text-align: center;
}
.detailsform {
    margin-top: 5px;
}
.formlabel {
    padding-right: 5px;
}
.timerbutton.timerbutton-on {
    color: hsl(0, 0%, 100%);
    font-weight: bold;
    background: hsla(330, 50%, 50%, 0.4);
}
.timerbutton.timerbutton-on:hover {
    box-shadow: 0 0 10px hsla(330, 50%, 50%, 0.4);
    background: hsla(330, 50%, 50%, 0.6);
    color: hsl(0, 0%, 100%);
}
#room-pokepaste {
    position: fixed !important;
    top: 56px !important;
    right: 0 !important;
    bottom: 0 !important;
    left: 716px !important;
    width: 824px !important;
    height: auto !important;
    margin: 6px !important;
    padding: 0 !important;
    box-sizing: border-box !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
    color: #fff !important;
    border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
    font-family: "Lexend", sans-serif !important;
}
#room-pokepaste,
#room-pokepaste * {
    font-family: "Lexend", sans-serif !important;
}
#room-pokepaste .ps-pp-tabs {
    flex: 0 0 38px !important;
    height: 38px !important;
    min-height: 38px !important;
    display: flex !important;
    align-items: stretch !important;
    gap: 3px !important;
    padding: 5px 7px 0 !important;
    box-sizing: border-box !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    background: rgba(0, 0, 0, 0.52) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.09) !important;
    scrollbar-width: thin !important;
}
#room-pokepaste .ps-pp-tabs {
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
}
#room-pokepaste .ps-pp-tabs::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
}
#room-pokepaste .ps-pp-tab {
    flex: 0 0 auto !important;
    max-width: 190px !important;
    min-width: 74px !important;
    height: 33px !important;
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
    padding: 0 7px 0 11px !important;
    box-sizing: border-box !important;
    border: 1px solid transparent !important;
    border-bottom: 0 !important;
    border-radius: 7px 7px 0 0 !important;
    background: rgba(255, 255, 255, 0.045) !important;
    color: rgba(255, 255, 255, 0.58) !important;
    cursor: pointer !important;
    user-select: none !important;
    font-size: 10px !important;
    font-weight: 500 !important;
    transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease !important;
}
#room-pokepaste .ps-pp-tab:hover {
    background: rgba(255, 255, 255, 0.09) !important;
    color: #fff !important;
}
#room-pokepaste .ps-pp-tab.active {
    background: rgba(25, 25, 29, 0.96) !important;
    border-color: rgba(255, 255, 255, 0.12) !important;
    color: #fff !important;
    box-shadow: 0 -1px 10px rgba(0, 0, 0, 0.15) !important;
}
#room-pokepaste .ps-pp-tab-name {
    flex: 1 1 auto !important;
    min-width: 0 !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
}
#room-pokepaste .ps-pp-tab-close {
    flex: 0 0 19px !important;
    width: 19px !important;
    height: 19px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    border: 0 !important;
    border-radius: 5px !important;
    background: transparent !important;
    color: rgba(255, 255, 255, 0.45) !important;
    cursor: pointer !important;
    font-size: 14px !important;
    line-height: 1 !important;
}
#room-pokepaste .ps-pp-tab-close:hover {
    background: rgba(255, 255, 255, 0.13) !important;
    color: #fff !important;
}
#room-pokepaste .ps-pp-tab-add {
    flex: 0 0 31px !important;
    width: 31px !important;
    height: 33px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    border: 0 !important;
    border-radius: 7px 7px 0 0 !important;
    background: transparent !important;
    color: rgba(255, 255, 255, 0.65) !important;
    cursor: pointer !important;
    font-size: 22px !important;
    font-weight: 300 !important;
    line-height: 1 !important;
}
#room-pokepaste .ps-pp-tab-add:hover {
    background: rgba(255, 255, 255, 0.09) !important;
    color: #fff !important;
}
#room-pokepaste .ps-pp-toolbar {
    flex: 0 0 46px !important;
    height: 46px !important;
    min-height: 46px !important;
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
    padding: 7px 9px !important;
    box-sizing: border-box !important;
    background: rgba(0, 0, 0, 0.4) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.09) !important;
}
#room-pokepaste .ps-pp-toolbar-title {
    text-align: center !important;
    flex: 0 0 260px !important;
    width: 250px !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
    color: rgba(255, 255, 255, 0.94) !important;
    font-size: 15px !important;
    font-weight: 700 !important;
    line-height: 32px !important;
    padding: 0 4px !important;
    box-sizing: border-box !important;
}
#room-pokepaste .ps-pp-url {
    max-width: 250px !important;
    text-align: center !important;
    flex: 1 1 160px !important;
    height: 32px !important;
    padding: 0 10px !important;
    box-sizing: border-box !important;
    border: 1px solid rgba(255, 255, 255, 0.13) !important;
    border-radius: 6px !important;
    outline: none !important;
    background: rgba(255, 255, 255, 0.06) !important;
    color: rgba(255, 255, 255, 0.92) !important;
    font-size: 11px !important;
    font-weight: 400 !important;
}
#room-pokepaste .ps-pp-url:focus {
    border-color: rgba(255, 255, 255, 0.28) !important;
    background: rgba(255, 255, 255, 0.09) !important;
}
#room-pokepaste .ps-pp-url::placeholder {
    color: rgba(255, 255, 255, 0.38) !important;
}
#room-pokepaste .ps-pp-load,
#room-pokepaste .ps-pp-add,
#room-pokepaste .ps-pp-copy,
#room-pokepaste .ps-pp-share {
    flex: 0 0 auto !important;
    height: 32px !important;
    padding: 0 12px !important;
    border: 0 !important;
    border-radius: 6px !important;
    cursor: pointer !important;
    font-size: 11px !important;
    font-weight: 600 !important;
}
#room-pokepaste .ps-pp-load {
    margin-left: 35px !important;
    background: rgba(255, 255, 255, 0.12) !important;
    color: rgba(255, 255, 255, 0.9) !important;
}
#room-pokepaste .ps-pp-load:hover {
    background: rgba(255, 255, 255, 0.2) !important;
}
#room-pokepaste .ps-pp-load:disabled {
    opacity: 0.5 !important;
    cursor: wait !important;
}
#room-pokepaste .ps-pp-add {
    background: rgba(90, 170, 105, 0.16) !important;
    color: rgba(180, 235, 190, 0.95) !important;
}
#room-pokepaste .ps-pp-add:hover {
    background: rgba(90, 170, 105, 0.28) !important;
    color: #d7ffdc !important;
}
#room-pokepaste .ps-pp-add:disabled {
    opacity: 0.35 !important;
    cursor: default !important;
}
#room-pokepaste .ps-pp-copy {
    background: rgba(255, 255, 255, 0.07) !important;
    color: rgba(255, 255, 255, 0.82) !important;
}
#room-pokepaste .ps-pp-copy:hover {
    background: rgba(255, 255, 255, 0.17) !important;
    color: #fff !important;
}
#room-pokepaste .ps-pp-copy:disabled {
    opacity: 0.35 !important;
    cursor: default !important;
}
#room-pokepaste .ps-pp-copy.copied {
    background: rgba(70, 170, 85, 0.25) !important;
    color: #a5e8aa !important;
}
#room-pokepaste .ps-pp-share {
    background: rgba(255, 255, 255, 0.07) !important;
    color: rgba(255, 255, 255, 0.82) !important;
}
#room-pokepaste .ps-pp-share:hover {
    background: rgba(255, 255, 255, 0.17) !important;
    color: #fff !important;
}
#room-pokepaste .ps-pp-share.copied {
    background: rgba(70, 170, 85, 0.25) !important;
    color: #a5e8aa !important;
}
#room-pokepaste .ps-pp-content {
    flex: 1 1 auto !important;
    min-height: 0 !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    padding: 10px !important;
    box-sizing: border-box !important;
}
#room-pokepaste .ps-pp-welcome,
#room-pokepaste .ps-pp-status {
    min-height: 200px !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
    padding: 20px !important;
    box-sizing: border-box !important;
}
#room-pokepaste .ps-pp-welcome-title {
    color: rgba(255, 255, 255, 0.72) !important;
    font-size: 15px !important;
    font-weight: 600 !important;
    margin-bottom: 5px !important;
}
#room-pokepaste .ps-pp-welcome-text {
    color: rgba(255, 255, 255, 0.4) !important;
    font-size: 11px !important;
    line-height: 1.5 !important;
    max-width: 280px !important;
}
#room-pokepaste .ps-pp-status {
    color: rgba(255, 255, 255, 0.45) !important;
    font-size: 12px !important;
    line-height: 1.5 !important;
    white-space: pre-line !important;
}
#room-pokepaste .ps-pp-error {
    color: #ff7777 !important;
}
#room-pokepaste .ps-pp-footer {
    margin: 10px 2px 4px 2px !important;
    padding: 12px 2px 14px 2px !important;
    border-top: 1px solid rgba(255, 255, 255, 0.07) !important;
    text-align: left !important;
    flex: 0 0 auto !important;
}
#room-pokepaste .ps-pp-author {
    color: #fff !important;
    font-size: 15px !important;
    font-weight: 700 !important;
    line-height: 1.3 !important;
    word-break: break-word !important;
}
#room-pokepaste .ps-pp-author-by {
    color: #fff !important;
    font-weight: 700 !important;
}
#room-pokepaste .ps-pp-author-name {
    font-weight: 700 !important;
}
#room-pokepaste .ps-pp-team {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 8px !important;
    width: 100% !important;
}
#room-pokepaste .ps-pp-pokemon {
    position: relative !important;
    cursor: pointer !important;
    min-width: 0 !important;
    min-height: 95px !important;
    padding: 8px 7px 9px 88px !important;
    box-sizing: border-box !important;
    background: rgba(0, 0, 0, 0.4) !important;
    border: 1px solid rgba(0, 0, 0, 0.7) !important;
    border-radius: 7px !important;
    color: rgba(255, 255, 255, 0.82) !important;
    font-size: 10px !important;
    line-height: 1.4 !important;
    overflow: hidden !important;
}
#room-pokepaste .ps-pp-pokemon {
    transition: background 0.25s ease, border-color 0.25s ease,
        box-shadow 0.25s ease !important;
}
#room-pokepaste .ps-pp-pokemon.ps-pp-copied,
#room-pokepaste .ps-pp-pokemon.ps-pp-copied:hover {
    border: 1px solid rgba(90, 255, 125, 0.95) !important;
    background: rgba(30, 180, 75, 0.22) !important;
    box-shadow: 0 0 0 1px rgba(90, 255, 125, 0.35),
        0 0 24px rgba(30, 220, 90, 0.22) !important;
}
#room-pokepaste .ps-pp-pokemon::after {
    content: "" !important;
    position: absolute !important;
    inset: 0 !important;
    z-index: 20 !important;
    pointer-events: none !important;
    border-radius: inherit !important;
    background: rgba(35, 190, 75, 0.28) !important;
    border: 1px solid rgba(110, 255, 140, 0.35) !important;
    box-shadow: inset 0 0 35px rgba(60, 255, 100, 0.16) !important;
    backdrop-filter: blur(2px) !important;
    -webkit-backdrop-filter: blur(2px) !important;
    opacity: 0 !important;
    transition: opacity 0.25s ease !important;
}
#room-pokepaste .ps-pp-pokemon.ps-pp-copied::after {
    opacity: 1 !important;
}
#room-pokepaste .ps-pp-pokemon::before {
    content: "Copied!" !important;
    position: absolute !important;
    left: 50% !important;
    top: 50% !important;
    transform: translate(-50%, -50%) !important;
    z-index: 30 !important;
    pointer-events: none !important;
    padding: 7px 15px !important;
    border-radius: 7px !important;
    background: rgba(15, 55, 25, 0.9) !important;
    border: 1px solid rgba(120, 255, 145, 0.7) !important;
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.4), 0 0 18px rgba(50, 255, 100, 0.2) !important;
    color: #fff !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6) !important;
    opacity: 0 !important;
    transition: opacity 0.25s ease !important;
}
#room-pokepaste .ps-pp-pokemon.ps-pp-copied::before {
    opacity: 1 !important;
}
#room-pokepaste .ps-pp-pokemon:hover {
    background: rgba(0, 0, 0, 0.3) !important;
}
#room-pokepaste .ps-pp-sprite {
    position: absolute !important;
    left: 2px !important;
    top: 5px !important;
    width: 82px !important;
    height: 82px !important;
    object-fit: contain !important;
    pointer-events: none !important;
}
#room-pokepaste .ps-pp-item-name {
    display: inline !important;
    color: #fff !important;
    font-weight: 500 !important;
    opacity: 1 !important;
    visibility: visible !important;
}
#room-pokepaste .ps-pp-name {
    margin-bottom: 5px !important;
    color: rgba(255, 255, 255, 0.95) !important;
    font-size: 12px !important;
    font-weight: 700 !important;
    line-height: 1.25 !important;
    word-break: break-word !important;
}
#room-pokepaste .ps-pp-field {
    margin: 1px 0 !important;
    font-size: 11px !important
                ;
    color: rgba(255, 255, 255, 0.72) !important;
    word-break: break-word !important;
}
#room-pokepaste .ps-pp-label {
    color: rgba(255, 255, 255, 0.4) !important;
}
#room-pokepaste .ps-pp-moves {
    font-size: 11px !important;
    margin-top: 6px !important;
    padding-top: 5px !important;
    border-top: 1px solid rgba(255, 255, 255, 0.06) !important;
}
#room-pokepaste .ps-pp-move {
    margin: 1px 0 !important;
    color: rgba(255, 255, 255, 0.8) !important;
    word-break: break-word !important;
    font-weight: 600 !important;
}
#room-pokepaste .ps-pp-sprite-link {
    position: absolute !important;
    left: 2px !important;
    top: 5px !important;
    width: 82px !important;
    height: 82px !important;
    display: block !important;
    cursor: pointer !important;
    z-index: 2 !important;
}
#room-pokepaste .ps-pp-sprite {
    position: absolute !important;
    inset: 0 !important;
    width: 82px !important;
    height: 82px !important;
    object-fit: contain !important;
    pointer-events: none !important;
}
#room-pokepaste .ps-pp-item-icon {
    position: absolute !important;
    left: 61px !important;
    top: 67px !important;
    width: 24px !important;
    height: 24px !important;
    display: inline-block !important;
    background-repeat: no-repeat !important;
    z-index: 4 !important;
    pointer-events: none !important;
}
#room-pokepaste .ps-pp-ev-stat {
    font-weight: 700 !important;
}
#room-pokepaste .ps-pp-ev-hp {
    color: #ff4b4b !important;
}
#room-pokepaste .ps-pp-ev-atk {
    color: #ff8a00 !important;
}
#room-pokepaste .ps-pp-ev-def {
    color: #f4c542 !important;
}
#room-pokepaste .ps-pp-ev-spa {
    color: #4aa3ff !important;
}
#room-pokepaste .ps-pp-ev-spd {
    color: #42c96b !important;
}
#room-pokepaste .ps-pp-ev-spe {
    color: #e45cff !important;
}
#room-pokepaste .ps-pp-name {
    transition: color 0.12s ease !important;
}
#room-pokepaste .ps-pp-author {
    font-weight: 700 !important;
}
#room-pokepaste .ps-pp-move {
    transition: color 0.1s ease !important;
}
@keyframes psPPStellarRainbow {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
}
#room-pokepaste .ps-pp-404 {
    height: 100%;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}
#room-pokepaste .ps-pp-404-image {
    width: 300px;
    margin-top: -150px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}
#room-pokepaste .ps-pp-404-image img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
}
#room-pokepaste .ps-pp-404-txt {
    font-weight: 700;
}
#room-pokepaste .ps-pp-404-title {
    opacity: 0.4;
    font-size: 18px;
    font-weight: 700;
    margin-top: 10px;
}
#room-pokepaste .ps-pp-404-buttons {
    display: flex;
    gap: 10px;
    margin-top: 20px;
}
#room-pokepaste .ps-pp-force,
#room-pokepaste .ps-pp-home {
    padding: 8px 14px;
    border: 0;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
}
#room-pokepaste .ps-pp-force-image {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
#room-pokepaste .ps-pp-force-image video {
    border-radius: 6px !important;
}
#room-pokepaste .ps-pp-force-image img {
    width: 160px;
    height: 160px;
    image-rendering: pixelated;
}
:root {
    --bg-giratina: url("https://images5.alphacoders.com/107/thumb-1920-1073999.jpg");
    --bg-rayquaza: url("https://images3.alphacoders.com/104/thumb-1920-1046496.png");
    --bg-palkia: url("https://images4.alphacoders.com/104/thumb-1920-1048449.png");
    --bg-pikachu: url("https://images4.alphacoders.com/137/thumb-1920-1377211.jpg");
}
[style*="client-bg-charizards.jpg"] {
    background-position: left center !important;
    background-image: var(--bg-giratina) !important;
}
[style*="client-bg-horizon.jpg"] {
    background-position: center center !important;
    background-image: var(--bg-rayquaza) !important;
}
[style*="client-bg-ocean.jpg"] {
    background-position: left center !important;
    background-image: var(--bg-palkia) !important;
}
[style*="client-bg-shaymin.jpg"] {
    background-position: left center !important;
    background-image: var(--bg-pikachu) !important;
}
.ps-popup[style*="max-width: 448px"] p:nth-of-type(1),
.ps-popup[style*="max-width: 448px"] p:nth-of-type(3),
.ps-popup[style*="max-width: 448px"] p:nth-of-type(4),
.ps-popup[style*="max-width: 448px"] p:nth-of-type(5) {
    display: none;
}
.ps-popup[style*="max-width: 448px"] p:nth-of-type(2) > strong {
    font-size: 0;
}
.ps-popup[style*="max-width: 448px"] p:nth-of-type(2) > strong::after {
    content: "Select your Theme here!";
    font-size: 14px;
}
.ps-popup[style*="max-width: 448px"]
    .bglist:first-of-type
    > button[name="setBg"] {
    display: none;
}
button[name="setBg"][value="charizards"],
button[name="setBg"][value="horizon"],
button[name="setBg"][value="ocean"],
button[name="setBg"][value="shaymin"],
button[name="setBg"][value="solidblue"] {
    font-size: 0;
}
button[name="setBg"][value="charizards"]::after {
    content: "Giratina";
    font-size: 12px;
}
button[name="setBg"][value="horizon"]::after {
    content: "Rayquaza";
    font-size: 12px;
}
button[name="setBg"][value="ocean"]::after {
    content: "Palkia";
    font-size: 12px;
}
button[name="setBg"][value="shaymin"]::after {
    content: "Pikachu";
    font-size: 12px;
}
button[name="setBg"][value="solidblue"]::before {
    content: "Work In Progress";
    position: absolute;
    width: 150px;
    text-align: center;
    font-weight: 650;
    left: 163px;
    top: 172px;
    font-size: 20px;
}
button[name="setBg"][value="solidblue"]::after {
    content: "Custom Theme";
    font-size: 12px;
}
button[name="setBg"][value="charizards"] > span {
    background: var(--bg-giratina) !important;
    background-size: cover !important;
    background-position: -20px center !important;
}
button[name="setBg"][value="horizon"] > span {
    background: var(--bg-rayquaza) !important;
    background-size: cover !important;
    background-position: center center !important;
}
button[name="setBg"][value="ocean"] > span {
    background: var(--bg-palkia) !important;
    background-size: cover !important;
    background-position: -40px center !important;
}
button[name="setBg"][value="shaymin"] > span {
    background: var(--bg-pikachu) !important;
    background-size: cover !important;
    background-position: -20px center !important;
}
button[name="setBg"][value="solidblue"] > span {
    background: #181818 !important;
}
.ps-popup[style*="min-width: 160px; position: absolute; margin: 0px; top: 40px; right: 10px;"]
    hr:nth-of-type(1),
.ps-popup[style*="min-width: 160px; position: absolute; margin: 0px; top: 40px; right: 10px;"]
    p:nth-of-type(5),
.ps-popup[style*="min-width: 160px; position: absolute; margin: 0px; top: 40px; right: 10px;"]
    p:nth-of-type(6),
.ps-popup[style*="min-width: 160px; position: absolute; margin: 0px; top: 40px; right: 10px;"]
    p:nth-of-type(7),
.ps-popup[style*="min-width: 160px; position: absolute; margin: 0px; top: 40px; right: 10px;"]
    p:nth-of-type(8),
.ps-popup[style*="min-width: 160px; position: absolute; margin: 0px; top: 40px; right: 10px;"]
    p:nth-of-type(9) {
    display: none;
}
.ps-popup[style*="min-width: 160px; position: absolute; margin: 0px; top: 40px; right: 10px;"]
    p:nth-of-type(10)
    > label,
.ps-popup[style*="min-width: 160px; position: absolute; margin: 0px; top: 40px; right: 10px;"]
    p:nth-of-type(10)
    > label
    > button {
    font-size: 0;
}
.ps-popup[style*="min-width: 160px; position: absolute; margin: 0px; top: 40px; right: 10px;"]
    p:nth-of-type(10)
    > label::before {
    content: "Theme: ";
    margin-left: 5px;
    margin-right: 5px;
    font-size: 13px;
}
.ps-popup[style*="min-width: 160px; position: absolute; margin: 0px; top: 40px; right: 10px;"]
    p:nth-of-type(10)
    > label
    > button::before {
    content: "Change Theme";
    font-size: 13px;
}
.menugroup > p > .button {
    margin-bottom: 5px;
    margin-left: 12px;
    width: 200px !important;
    height: 35px !important;
    text-transform: capitalize !important;
    font-weight: 600;
    position: relative;
    padding-left: 45px !important;
    overflow: visible !important;
    isolation: isolate;
    box-shadow: none !important;
    color: white !important;
    transition: color 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}
.menugroup > p > .button::before {
    content: "";
    position: absolute;
    top: 8px;
    width: 60px;
    height: 60px;
    transform: translateY(-50%);
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;
    pointer-events: none;
    z-index: 2;
    transition: transform 0.25s ease;
}
.menugroup > p > .button::after {
    content: "";
    position: absolute;
    top: 0;
    height: 100%;
    clip-path: polygon(0 0, 100% 0, 75% 100%, 0 100%);
    pointer-events: none;
    border-radius: 6px 0px 0px 6px;
    z-index: -1;
    transition: width 0.45s cubic-bezier(0.4, 0, 0.2, 1),
        left 0.45s cubic-bezier(0.4, 0, 0.2, 1),
        clip-path 0.45s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.35s ease;
}
.menugroup > p > .button:disabled {
    filter: grayscale(100%) !important;
    color: rgb(0 0 0 / 0.5) !important;
}
.menugroup > p > .button[disabled]:hover::before {
    transform: translateY(-50%) !important;
}
.menugroup > p > .button[disabled]::after {
    left: auto !important;
    right: 0 !important;
    width: 100% !important;
    border-radius: 6px !important;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%) !important;
}
body .button.mainmenu1[name="search"] > strong {
    position: relative !important;
    top: -1px !important;
    font-weight: 750 !important;
}
body .button.mainmenu1[name="search"] > small {
    font-size: 10px !important;
    position: relative !important;
    top: -1px !important;
}
body .button.mainmenu1[name="search"] {
    width: 200px;
    margin-bottom: 5px;
    height: 46px !important;
    text-transform: capitalize !important;
    font-weight: 600;
    position: relative;
    overflow: visible !important;
    isolation: isolate;
    box-shadow: none !important;
    color: white !important;
    transition: color 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}
body .button.mainmenu1[name="search"]::before {
    content: "";
    position: absolute;
    width: 75px;
    height: 75px;
    transform: translateY(-50%);
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;
    pointer-events: none;
    z-index: 2;
    transition: transform 0.25s ease;
}
body .button.mainmenu1[name="search"]::after {
    content: "";
    position: absolute;
    top: 0;
    height: 100%;
    clip-path: polygon(0 0, 100% 0, 75% 100%, 0 100%);
    pointer-events: none;
    border-radius: 6px 0px 0px 6px;
    z-index: -1;
    transition: width 0.45s cubic-bezier(0.4, 0, 0.2, 1),
        left 0.45s cubic-bezier(0.4, 0, 0.2, 1),
        clip-path 0.45s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.35s ease;
}
body .button.mainmenu1[name="search"]:disabled {
    filter: grayscale(100%) !important;
    color: rgb(0 0 0 / 0.5) !important;
}
body .button.mainmenu1[name="search"][disabled]:hover::before {
    transform: translateY(-50%) scaleX(-1) !important;
}
body .button.mainmenu1[name="search"][disabled]::after {
    left: auto !important;
    right: 0 !important;
    width: 100% !important;
    border-radius: 6px !important;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%) !important;
}
body[style*="charizards"] .menugroup > p > .button[value="teambuilder"] {
    background: rgb(195 194 195 / 0.2) !important;
}
body[style*="charizards"]
    .menugroup
    > p
    > .button[value="teambuilder"]::before {
    left: -25px;
    background-image: url("https://img.pokemondb.net/sprites/scarlet-violet/normal/giratina-altered.png");
    filter: drop-shadow(1px 0 0 #c3c2c3) drop-shadow(-1px 0 0 #c3c2c3)
        drop-shadow(0 1px 0 #c3c2c3) drop-shadow(0 -1px 0 #c3c2c3);
}
body[style*="charizards"] .menugroup > p > .button[value="teambuilder"]::after {
    left: 0px;
    width: 40px;
    background: #c3c2c3;
}
body[style*="charizards"]
    .menugroup
    > p
    > .button[value="teambuilder"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="charizards"]
    .menugroup
    > p
    > .button[value="teambuilder"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="charizards"] .menugroup > p > .button[value="teambuilder"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="charizards"] .menugroup > p > .button[value="ladder"] {
    background: rgb(192 40 123 / 0.2) !important;
}
body[style*="charizards"] .menugroup > p > .button[value="ladder"]::before {
    left: -27px;
    top: 11px;
    background-image: url("https://img.pokemondb.net/sprites/scarlet-violet/normal/hoopa-unbound.png");
    filter: drop-shadow(1px 0 0 #c0287b) drop-shadow(-1px 0 0 #c0287b)
        drop-shadow(0 1px 0 #c0287b) drop-shadow(0 -1px 0 #c0287b);
}
body[style*="charizards"] .menugroup > p > .button[value="ladder"]::after {
    left: 0;
    width: 40px;
    background: #c0287b;
}
body[style*="charizards"]
    .menugroup
    > p
    > .button[value="ladder"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="charizards"]
    .menugroup
    > p
    > .button[value="ladder"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="charizards"] .menugroup > p > .button[value="ladder"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="charizards"] .menugroup > p > .button[value="/smogtours"] {
    margin-bottom: 0px;
    background: #54407333 !important;
}
body[style*="charizards"] .menugroup > p > .button[value="/smogtours"]::before {
    left: -23px;
    top: 16px;
    width: 47px;
    height: 47px;
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/mega-gengar-sprite.png");
    filter: drop-shadow(1px 0 0 #544073) drop-shadow(-1px 0 0 #544073)
        drop-shadow(0 1px 0 #544073) drop-shadow(0 -1px 0 #544073);
}
body[style*="charizards"] .menugroup > p > .button[value="/smogtours"]::after {
    left: 0;
    width: 40px;
    background: #544073;
}
body[style*="charizards"]
    .menugroup
    > p
    > .button[value="/smogtours"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="charizards"]
    .menugroup
    > p
    > .button[value="/smogtours"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="charizards"] .menugroup > p > .button[value="/smogtours"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="charizards"] .menugroup > p > .button[value="battles"] {
    margin-bottom: 0px;
    background: rgb(115 117 107 / 0.2) !important;
}
body[style*="charizards"] .menugroup > p > .button[value="battles"]::before {
    left: -27px;
    top: 10px;
    background-image: url("https://img.pokemondb.net/sprites/scarlet-violet/normal/dusknoir.png");
    filter: drop-shadow(1px 0 0 #73756b) drop-shadow(-1px 0 0 #73756b)
        drop-shadow(0 1px 0 #73756b) drop-shadow(0 -1px 0 #73756b);
}
body[style*="charizards"] .menugroup > p > .button[value="battles"]::after {
    left: 0;
    width: 40px;
    background: #73756b;
}
body[style*="charizards"]
    .menugroup
    > p
    > .button[value="battles"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="charizards"]
    .menugroup
    > p
    > .button[value="battles"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="charizards"] .menugroup > p > .button[value="battles"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="charizards"] .menugroup > p > .button[name="finduser"] {
    background: #4d4a4a33 !important;
}
body[style*="charizards"] .menugroup > p > .button[name="finduser"]::before {
    left: -27px;
    background-image: url("https://img.pokemondb.net/sprites/scarlet-violet/normal/darkrai.png");
    filter: drop-shadow(1px 0 0 #4d4a4a) drop-shadow(-1px 0 0 #4d4a4a)
        drop-shadow(0 1px 0 #4d4a4a) drop-shadow(0 -1px 0 #4d4a4a);
}
body[style*="charizards"] .menugroup > p > .button[name="finduser"]::after {
    left: 0;
    width: 40px;
    background: #4d4a4a;
}
body[style*="charizards"]
    .menugroup
    > p
    > .button[name="finduser"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="charizards"]
    .menugroup
    > p
    > .button[name="finduser"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="charizards"] .menugroup > p > .button[name="finduser"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="charizards"] .menugroup > p > .button[value="/friends"] {
    background: #00d5d233 !important;
}
body[style*="charizards"] .menugroup > p > .button[value="/friends"]::before {
    left: -27px;
    background-image: url("https://img.pokemondb.net/sprites/scarlet-violet/normal/dragapult.png");
    filter: drop-shadow(1px 0 0 #00d5d2) drop-shadow(-1px 0 0 #00d5d2)
        drop-shadow(0 1px 0 #00d5d2) drop-shadow(0 -1px 0 #00d5d2);
}
body[style*="charizards"] .menugroup > p > .button[value="/friends"]::after {
    left: 0;
    width: 40px;
    background: #00d5d2;
}
body[style*="charizards"]
    .menugroup
    > p
    > .button[value="/friends"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="charizards"]
    .menugroup
    > p
    > .button[value="/friends"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="charizards"] .menugroup > p > .button[value="/friends"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="charizards"] .menugroup > p > .button[value="resources"] {
    margin-bottom: 0px;
    background: #f7f4c533 !important;
}
body[style*="charizards"] .menugroup > p > .button[value="resources"]::before {
    left: -45px;
    top: -12px;
    transform-origin: center 80px !important;
    height: 100px;
    width: 100px;
    background-image: url("https://img.pokemondb.net/sprites/scarlet-violet/normal/mimikyu.png");
    filter: drop-shadow(1px 0 0 #f7f4c5) drop-shadow(-1px 0 0 #f7f4c5)
        drop-shadow(0 1px 0 #f7f4c5) drop-shadow(0 -1px 0 #f7f4c5);
}
body[style*="charizards"] .menugroup > p > .button[value="resources"]::after {
    left: 0;
    width: 40px;
    background: #f7f4c5;
}
body[style*="charizards"]
    .menugroup
    > p
    > .button[value="resources"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="charizards"]
    .menugroup
    > p
    > .button[value="resources"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="charizards"] .menugroup > p > .button[value="resources"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="charizards"] .menugroup > p > .button[value="rooms"] {
    margin-bottom: 10px;
    background: #f8424733 !important;
}
body[style*="charizards"] .menugroup > p > .button[value="rooms"]::before {
    left: -27px;
    top: 20px;
    transform-origin: center 30px !important;
    height: 55px;
    width: 55px;
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/yveltal-sprite.png");
    filter: drop-shadow(1px 0 0 #f84247) drop-shadow(-1px 0 0 #f84247)
        drop-shadow(0 1px 0 #f84247) drop-shadow(0 -1px 0 #f84247);
}
body[style*="charizards"] .menugroup > p > .button[value="rooms"]::after {
    left: 0;
    width: 40px;
    background: #f84247;
}
body[style*="charizards"] .menugroup > p > .button[value="rooms"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="charizards"]
    .menugroup
    > p
    > .button[value="rooms"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="charizards"] .menugroup > p > .button[value="rooms"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="charizards"] .button.mainmenu1[name="search"] {
    background: #e6ce5f33 !important;
    margin-bottom: 0px;
    padding-top: 0 !important;
}
body[style*="charizards"] .button.mainmenu1[name="search"]::before {
    transform: translateY(-50%) scaleX(-1);
    top: 20px;
    right: -45px;
    background-image: url("https://img.pokemondb.net/sprites/scarlet-violet/normal/giratina-origin.png");
    filter: drop-shadow(1px 0 0 #e6ce5f) drop-shadow(-1px 0 0 #e6ce5f)
        drop-shadow(0 1px 0 #e6ce5f) drop-shadow(0 -1px 0 #e6ce5f);
}
body[style*="charizards"] .button.mainmenu1[name="search"]::after {
    left: auto;
    right: 0;
    width: 0px;
    background: #e6ce5f;
    border-radius: 0 6px 6px 0;
    clip-path: polygon(25% 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="charizards"] .button.mainmenu1[name="search"]:hover::after {
    left: auto;
    right: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="charizards"][style*="charizards"]
    .button.mainmenu1[name="search"]:hover::before {
    transform: translateY(-50%) scaleX(-1) scale(1.15);
}
body[style*="charizards"] .button.mainmenu1[name="search"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="horizon"] .menugroup > p > .button[value="teambuilder"] {
    background: #6eb78133 !important;
}
body[style*="horizon"] .menugroup > p > .button[value="teambuilder"]::before {
    left: -25px;
    top: 15px;
    background-image: url("https://img.pokemondb.net/sprites/scarlet-violet/normal/rayquaza.png");
    filter: drop-shadow(1px 0 0 #6eb781) drop-shadow(-1px 0 0 #6eb781)
        drop-shadow(0 1px 0 #6eb781) drop-shadow(0 -1px 0 #6eb781);
}
body[style*="horizon"] .menugroup > p > .button[value="teambuilder"]::after {
    left: 0px;
    width: 40px;
    background: #6eb781;
}
body[style*="horizon"]
    .menugroup
    > p
    > .button[value="teambuilder"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="horizon"]
    .menugroup
    > p
    > .button[value="teambuilder"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="horizon"] .menugroup > p > .button[value="teambuilder"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="horizon"] .menugroup > p > .button[value="ladder"] {
    background: #9cc44833 !important;
}
body[style*="horizon"] .menugroup > p > .button[value="ladder"]::before {
    left: -22px;
    top: 16px;
    width: 53px;
    height: 53px;
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/zygarde-sprite.png");
    filter: drop-shadow(1px 0 0 #9cc448) drop-shadow(-1px 0 0 #9cc448)
        drop-shadow(0 1px 0 #9cc448) drop-shadow(0 -1px 0 #9cc448);
}
body[style*="horizon"] .menugroup > p > .button[value="ladder"]::after {
    left: 0;
    width: 40px;
    background: #9cc448;
}
body[style*="horizon"] .menugroup > p > .button[value="ladder"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="horizon"] .menugroup > p > .button[value="ladder"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="horizon"] .menugroup > p > .button[value="ladder"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="horizon"] .menugroup > p > .button[value="/smogtours"] {
    margin-bottom: 0px;
    background: #ff415033 !important;
}
body[style*="horizon"] .menugroup > p > .button[value="/smogtours"]::before {
    left: -24px;
    top: 10px;
    background-image: url("https://img.pokemondb.net/sprites/scarlet-violet/normal/eternatus.png");
    filter: drop-shadow(1px 0 0 #ff4150) drop-shadow(-1px 0 0 #ff4150)
        drop-shadow(0 1px 0 #ff4150) drop-shadow(0 -1px 0 #ff4150);
}
body[style*="horizon"] .menugroup > p > .button[value="/smogtours"]::after {
    left: 0;
    width: 40px;
    background: #ff4150;
}
body[style*="horizon"]
    .menugroup
    > p
    > .button[value="/smogtours"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="horizon"]
    .menugroup
    > p
    > .button[value="/smogtours"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="horizon"] .menugroup > p > .button[value="/smogtours"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="horizon"] .menugroup > p > .button[value="battles"] {
    margin-bottom: 0px;
    background: #6e8fb833 !important;
}
body[style*="horizon"] .menugroup > p > .button[value="battles"]::before {
    left: -27px;
    background-image: url("https://img.pokemondb.net/sprites/scarlet-violet/normal/hydreigon.png");
    filter: drop-shadow(1px 0 0 #6e8fb8) drop-shadow(-1px 0 0 #6e8fb8)
        drop-shadow(0 1px 0 #6e8fb8) drop-shadow(0 -1px 0 #6e8fb8);
}
body[style*="horizon"] .menugroup > p > .button[value="battles"]::after {
    left: 0;
    width: 40px;
    background: #6e8fb8;
}
body[style*="horizon"] .menugroup > p > .button[value="battles"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="horizon"] .menugroup > p > .button[value="battles"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="horizon"] .menugroup > p > .button[value="battles"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="horizon"] .menugroup > p > .button[name="finduser"] {
    background: #fcc25d33 !important;
}
body[style*="horizon"] .menugroup > p > .button[name="finduser"]::before {
    left: -24px;
    background-image: url("https://img.pokemondb.net/sprites/scarlet-violet/normal/dragonite.png");
    filter: drop-shadow(1px 0 0 #fcc25d) drop-shadow(-1px 0 0 #fcc25d)
        drop-shadow(0 1px 0 #fcc25d) drop-shadow(0 -1px 0 #fcc25d);
}
body[style*="horizon"] .menugroup > p > .button[name="finduser"]::after {
    left: 0;
    width: 40px;
    background: #fcc25d;
}
body[style*="horizon"] .menugroup > p > .button[name="finduser"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="horizon"] .menugroup > p > .button[name="finduser"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="horizon"] .menugroup > p > .button[name="finduser"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="horizon"] .menugroup > p > .button[value="/friends"] {
    background: #4792d033 !important;
}
body[style*="horizon"] .menugroup > p > .button[value="/friends"]::before {
    left: -25px;
    top: 12px;
    background-image: url("https://img.pokemondb.net/sprites/scarlet-violet/normal/latios.png");
    filter: drop-shadow(1px 0 0 #4792d0) drop-shadow(-1px 0 0 #4792d0)
        drop-shadow(0 1px 0 #4792d0) drop-shadow(0 -1px 0 #4792d0);
}
body[style*="horizon"] .menugroup > p > .button[value="/friends"]::after {
    left: 0;
    width: 40px;
    background: #4792d0;
}
body[style*="horizon"] .menugroup > p > .button[value="/friends"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="horizon"]
    .menugroup
    > p
    > .button[value="/friends"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="horizon"] .menugroup > p > .button[value="/friends"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="horizon"] .menugroup > p > .button[value="resources"] {
    margin-bottom: 0px;
    background: #c5c8cb33 !important;
}
body[style*="horizon"] .menugroup > p > .button[value="resources"]::before {
    left: -24px;
    top: 11px;
    height: 60px;
    width: 60px;
    background-image: url("https://img.pokemondb.net/sprites/scarlet-violet/normal/kyurem-white.png");
    filter: drop-shadow(1px 0 0 #c5c8cb) drop-shadow(-1px 0 0 #c5c8cb)
        drop-shadow(0 1px 0 #c5c8cb) drop-shadow(0 -1px 0 #c5c8cb);
}
body[style*="horizon"] .menugroup > p > .button[value="resources"]::after {
    left: 0;
    width: 40px;
    background: #c5c8cb;
}
body[style*="horizon"]
    .menugroup
    > p
    > .button[value="resources"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="horizon"]
    .menugroup
    > p
    > .button[value="resources"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="horizon"] .menugroup > p > .button[value="resources"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="horizon"] .menugroup > p > .button[value="rooms"] {
    margin-bottom: 10px;
    background: #ff3f3733 !important;
}
body[style*="horizon"] .menugroup > p > .button[value="rooms"]::before {
    left: -30px;
    top: 12px;
    background-image: url("https://img.pokemondb.net/sprites/scarlet-violet/normal/koraidon.png");
    filter: drop-shadow(1px 0 0 #ff3f37) drop-shadow(-1px 0 0 #ff3f37)
        drop-shadow(0 1px 0 #ff3f37) drop-shadow(0 -1px 0 #ff3f37);
}
body[style*="horizon"] .menugroup > p > .button[value="rooms"]::after {
    left: 0;
    width: 40px;
    background: #ff3f37;
}
body[style*="horizon"] .menugroup > p > .button[value="rooms"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="horizon"] .menugroup > p > .button[value="rooms"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="horizon"] .menugroup > p > .button[value="rooms"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="horizon"] .button.mainmenu1[name="search"] {
    background: #ae4a5033 !important;
    margin-bottom: 0px;
    padding-top: 0 !important;
}
body[style*="horizon"] .button.mainmenu1[name="search"]::before {
    transform: translateY(-50%) scaleX(-1);
    top: 25px;
    width: 70px;
    height: 70px;
    right: -37px;
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/mega-rayquaza-sprite.png");
    filter: drop-shadow(1px 0 0 #ae4a50) drop-shadow(-1px 0 0 #ae4a50)
        drop-shadow(0 1px 0 #ae4a50) drop-shadow(0 -1px 0 #ae4a50);
}
body[style*="horizon"] .button.mainmenu1[name="search"]::after {
    left: auto;
    right: 0;
    width: 0px;
    background: #ae4a50;
    border-radius: 0 6px 6px 0;
    clip-path: polygon(25% 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="horizon"] .button.mainmenu1[name="search"]:hover::after {
    left: auto;
    right: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="horizon"] .button.mainmenu1[name="search"]:hover::before {
    transform: translateY(-50%) scaleX(-1) scale(1.15);
}
body[style*="horizon"] .button.mainmenu1[name="search"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="ocean"] .menugroup > p > .button[value="teambuilder"] {
    background: #efe5ec33 !important;
}
body[style*="ocean"] .menugroup > p > .button[value="teambuilder"]::before {
    left: -25px;
    top: 12px;
    background-image: url("https://img.pokemondb.net/sprites/scarlet-violet/normal/palkia.png");
    filter: drop-shadow(1px 0 0 #efe5ec) drop-shadow(-1px 0 0 #efe5ec)
        drop-shadow(0 1px 0 #efe5ec) drop-shadow(0 -1px 0 #efe5ec);
}
body[style*="ocean"] .menugroup > p > .button[value="teambuilder"]::after {
    left: 0px;
    width: 40px;
    background: #efe5ec;
}
body[style*="ocean"]
    .menugroup
    > p
    > .button[value="teambuilder"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="ocean"]
    .menugroup
    > p
    > .button[value="teambuilder"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="ocean"] .menugroup > p > .button[value="teambuilder"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="ocean"] .menugroup > p > .button[value="ladder"] {
    background: #266b9a33 !important;
}
body[style*="ocean"] .menugroup > p > .button[value="ladder"]::before {
    left: -30px;
    top: 17px;
    background-image: url("https://img.pokemondb.net/sprites/scarlet-violet/normal/dialga.png");
    filter: drop-shadow(1px 0 0 #266b9a) drop-shadow(-1px 0 0 #266b9a)
        drop-shadow(0 1px 0 #266b9a) drop-shadow(0 -1px 0 #266b9a);
}
body[style*="ocean"] .menugroup > p > .button[value="ladder"]::after {
    left: 0;
    width: 40px;
    background: #266b9a;
}
body[style*="ocean"] .menugroup > p > .button[value="ladder"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="ocean"] .menugroup > p > .button[value="ladder"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="ocean"] .menugroup > p > .button[value="ladder"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="ocean"] .menugroup > p > .button[value="/smogtours"] {
    margin-bottom: 0px;
    background: #1665ad33 !important;
}
body[style*="ocean"] .menugroup > p > .button[value="/smogtours"]::before {
    left: -27px;
    top: 7px;
    background-image: url("https://img.pokemondb.net/sprites/scarlet-violet/normal/kyogre.png");
    filter: drop-shadow(1px 0 0 #1665ad) drop-shadow(-1px 0 0 #1665ad)
        drop-shadow(0 1px 0 #1665ad) drop-shadow(0 -1px 0 #1665ad);
}
body[style*="ocean"] .menugroup > p > .button[value="/smogtours"]::after {
    left: 0;
    width: 40px;
    background: #1665ad;
}
body[style*="ocean"] .menugroup > p > .button[value="/smogtours"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="ocean"]
    .menugroup
    > p
    > .button[value="/smogtours"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="ocean"] .menugroup > p > .button[value="/smogtours"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="ocean"] .menugroup > p > .button[value="battles"] {
    margin-bottom: 0px;
    background: #f7fafc33 !important;
}
body[style*="ocean"] .menugroup > p > .button[value="battles"]::before {
    left: -23px;
    top: 13px;
    background-image: url("https://img.pokemondb.net/sprites/scarlet-violet/normal/lugia.png");
    filter: drop-shadow(1px 0 0 #f7fafc) drop-shadow(-1px 0 0 #f7fafc)
        drop-shadow(0 1px 0 #f7fafc) drop-shadow(0 -1px 0 #f7fafc);
}
body[style*="ocean"] .menugroup > p > .button[value="battles"]::after {
    left: 0;
    width: 40px;
    background: #f7fafc;
}
body[style*="ocean"] .menugroup > p > .button[value="battles"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="ocean"] .menugroup > p > .button[value="battles"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="ocean"] .menugroup > p > .button[value="battles"]:hover {
    color: #00000069 !important;
}
body[style*="ocean"] .menugroup > p > .button[name="finduser"] {
    background: #52c2ce33 !important;
}
body[style*="ocean"] .menugroup > p > .button[name="finduser"]::before {
    left: -24px;
    background-image: url("https://img.pokemondb.net/sprites/scarlet-violet/normal/walking-wake.png");
    filter: drop-shadow(1px 0 0 #52c2ce) drop-shadow(-1px 0 0 #52c2ce)
        drop-shadow(0 1px 0 #52c2ce) drop-shadow(0 -1px 0 #52c2ce);
}
body[style*="ocean"] .menugroup > p > .button[name="finduser"]::after {
    left: 0;
    width: 40px;
    background: #52c2ce;
}
body[style*="ocean"] .menugroup > p > .button[name="finduser"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="ocean"] .menugroup > p > .button[name="finduser"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="ocean"] .menugroup > p > .button[name="finduser"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="ocean"] .menugroup > p > .button[value="/friends"] {
    background: #4792d033 !important;
}
body[style*="ocean"] .menugroup > p > .button[value="/friends"]::before {
    left: -25px;
    top: 14px;
    width: 53px;
    height: 53px;
    background-image: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/misc/ash-greninja-sprite.png");
    filter: drop-shadow(1px 0 0 #4792d0) drop-shadow(-1px 0 0 #4792d0)
        drop-shadow(0 1px 0 #4792d0) drop-shadow(0 -1px 0 #4792d0);
}
body[style*="ocean"] .menugroup > p > .button[value="/friends"]::after {
    left: 0;
    width: 40px;
    background: #4792d0;
}
body[style*="ocean"] .menugroup > p > .button[value="/friends"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="ocean"] .menugroup > p > .button[value="/friends"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="ocean"] .menugroup > p > .button[value="/friends"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="ocean"] .menugroup > p > .button[value="resources"] {
    margin-bottom: 0px;
    background: #f1afaf33 !important;
}
body[style*="ocean"] .menugroup > p > .button[value="resources"]::before {
    left: -24px;
    top: 11px;
    height: 60px;
    width: 60px;
    background-image: url("https://img.pokemondb.net/sprites/scarlet-violet/normal/slowking.png");
    filter: drop-shadow(1px 0 0 #f1afaf) drop-shadow(-1px 0 0 #f1afaf)
        drop-shadow(0 1px 0 #f1afaf) drop-shadow(0 -1px 0 #f1afaf);
}
body[style*="ocean"] .menugroup > p > .button[value="resources"]::after {
    left: 0;
    width: 40px;
    background: #f1afaf;
}
body[style*="ocean"] .menugroup > p > .button[value="resources"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="ocean"] .menugroup > p > .button[value="resources"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="ocean"] .menugroup > p > .button[value="resources"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="ocean"] .menugroup > p > .button[value="rooms"] {
    margin-bottom: 10px;
    background: #63c6de33 !important;
}
body[style*="ocean"] .menugroup > p > .button[value="rooms"]::before {
    left: -35px;
    top: 1px;
    transform-origin: center 55px !important;
    width: 75px;
    height: 75px;
    background-image: url("https://img.pokemondb.net/sprites/scarlet-violet/normal/manaphy.png");
    filter: drop-shadow(1px 0 0 #63c6de) drop-shadow(-1px 0 0 #63c6de)
        drop-shadow(0 1px 0 #63c6de) drop-shadow(0 -1px 0 #63c6de);
}
body[style*="ocean"] .menugroup > p > .button[value="rooms"]::after {
    left: 0;
    width: 40px;
    background: #63c6de;
}
body[style*="ocean"] .menugroup > p > .button[value="rooms"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="ocean"] .menugroup > p > .button[value="rooms"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="ocean"] .menugroup > p > .button[value="rooms"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="ocean"] .button.mainmenu1[name="search"] {
    background: #af6cb833 !important;
    margin-bottom: 0px;
    padding-top: 0 !important;
}
body[style*="ocean"] .button.mainmenu1[name="search"]::before {
    transform: translateY(-50%) scaleX(-1);
    top: 17px;
    width: 80px;
    height: 80px;
    right: -45px;
    background-image: url("https://img.pokemondb.net/sprites/scarlet-violet/normal/palkia-origin.png");
    filter: drop-shadow(1px 0 0 #af6cb8) drop-shadow(-1px 0 0 #af6cb8)
        drop-shadow(0 1px 0 #af6cb8) drop-shadow(0 -1px 0 #af6cb8);
}
body[style*="ocean"] .button.mainmenu1[name="search"]::after {
    left: auto;
    right: 0;
    width: 0px;
    background: #af6cb8;
    border-radius: 0 6px 6px 0;
    clip-path: polygon(25% 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="ocean"] .button.mainmenu1[name="search"]:hover::after {
    left: auto;
    right: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="ocean"] .button.mainmenu1[name="search"]:hover::before {
    transform: translateY(-50%) scaleX(-1) scale(1.15);
}
body[style*="ocean"] .button.mainmenu1[name="search"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="shaymin"] .menugroup > p > .button[value="teambuilder"] {
    background: #de367033 !important;
}
body[style*="shaymin"] .menugroup > p > .button[value="teambuilder"]::before {
    left: -25px;
    top: 8px;
    background-image: url("https://img.pokemondb.net/sprites/scarlet-violet/normal/porygon-z.png");
    filter: drop-shadow(1px 0 0 #de3670) drop-shadow(-1px 0 0 #de3670)
        drop-shadow(0 1px 0 #de3670) drop-shadow(0 -1px 0 #de3670);
}
body[style*="shaymin"] .menugroup > p > .button[value="teambuilder"]::after {
    left: 0px;
    width: 40px;
    background: #de3670;
}
body[style*="shaymin"]
    .menugroup
    > p
    > .button[value="teambuilder"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="shaymin"]
    .menugroup
    > p
    > .button[value="teambuilder"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="shaymin"] .menugroup > p > .button[value="teambuilder"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="shaymin"] .menugroup > p > .button[value="ladder"] {
    background: #4f91ae33 !important;
}
body[style*="shaymin"] .menugroup > p > .button[value="ladder"]::before {
    left: -26px;
    top: 7px;
    background-image: url("https://img.pokemondb.net/sprites/scarlet-violet/normal/metagross.png");
    filter: drop-shadow(1px 0 0 #4f91ae) drop-shadow(-1px 0 0 #4f91ae)
        drop-shadow(0 1px 0 #4f91ae) drop-shadow(0 -1px 0 #4f91ae);
}
body[style*="shaymin"] .menugroup > p > .button[value="ladder"]::after {
    left: 0;
    width: 40px;
    background: #4f91ae;
}
body[style*="shaymin"] .menugroup > p > .button[value="ladder"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="shaymin"] .menugroup > p > .button[value="ladder"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="shaymin"] .menugroup > p > .button[value="ladder"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="shaymin"] .menugroup > p > .button[value="/smogtours"] {
    margin-bottom: 0px;
    background: #95b9d833 !important;
}
body[style*="shaymin"] .menugroup > p > .button[value="/smogtours"]::before {
    left: -27px;
    top: 17px;
    background-image: url("https://img.pokemondb.net/sprites/brilliant-diamond-shining-pearl/normal/machamp.png");
    filter: drop-shadow(1px 0 0 #95b9d8) drop-shadow(-1px 0 0 #95b9d8)
        drop-shadow(0 1px 0 #95b9d8) drop-shadow(0 -1px 0 #95b9d8);
}
body[style*="shaymin"] .menugroup > p > .button[value="/smogtours"]::after {
    left: 0;
    width: 40px;
    background: #95b9d8;
}
body[style*="shaymin"]
    .menugroup
    > p
    > .button[value="/smogtours"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="shaymin"]
    .menugroup
    > p
    > .button[value="/smogtours"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="shaymin"] .menugroup > p > .button[value="/smogtours"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="shaymin"] .menugroup > p > .button[value="battles"] {
    margin-bottom: 0px;
    background: #ad7f6533 !important;
}
body[style*="shaymin"] .menugroup > p > .button[value="battles"]::before {
    left: -30px;
    top: 5px;
    width: 65px;
    height: 65px;
    background-image: url("https://img.pokemondb.net/sprites/scarlet-violet/normal/noctowl.png");
    filter: drop-shadow(1px 0 0 #ad7f65) drop-shadow(-1px 0 0 #ad7f65)
        drop-shadow(0 1px 0 #ad7f65) drop-shadow(0 -1px 0 #ad7f65);
}
body[style*="shaymin"] .menugroup > p > .button[value="battles"]::after {
    left: 0;
    width: 40px;
    background: #ad7f65;
}
body[style*="shaymin"] .menugroup > p > .button[value="battles"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="shaymin"] .menugroup > p > .button[value="battles"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="shaymin"] .menugroup > p > .button[value="battles"]:hover {
    color: #00000069 !important;
}
body[style*="shaymin"] .menugroup > p > .button[name="finduser"] {
    background: #48667633 !important;
}
body[style*="shaymin"] .menugroup > p > .button[name="finduser"]::before {
    left: -40px;
    top: 18px;
    width: 85px;
    height: 85px;
    background-image: url("https://img.pokemondb.net/sprites/brilliant-diamond-shining-pearl/normal/unown-qm.png");
    filter: drop-shadow(1px 0 0 #486676) drop-shadow(-1px 0 0 #486676)
        drop-shadow(0 1px 0 #486676) drop-shadow(0 -1px 0 #486676);
}
body[style*="shaymin"] .menugroup > p > .button[name="finduser"]::after {
    left: 0;
    width: 40px;
    background: #486676;
}
body[style*="shaymin"] .menugroup > p > .button[name="finduser"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="shaymin"] .menugroup > p > .button[name="finduser"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="shaymin"] .menugroup > p > .button[name="finduser"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="shaymin"] .menugroup > p > .button[value="/friends"] {
    background: #ffffff33 !important;
}
body[style*="shaymin"] .menugroup > p > .button[value="/friends"]::before {
    left: -30px;
    top: 3px;
    width: 72px;
    height: 72px;
    transform-origin: center 50px;
    background-image: url("https://img.pokemondb.net/sprites/scarlet-violet/normal/sylveon.png");
    filter: drop-shadow(1px 0 0 #ffffff) drop-shadow(-1px 0 0 #ffffff)
        drop-shadow(0 1px 0 #ffffff) drop-shadow(0 -1px 0 #ffffff);
}
body[style*="shaymin"] .menugroup > p > .button[value="/friends"]::after {
    left: 0;
    width: 40px;
    background: #ffffff;
}
body[style*="shaymin"] .menugroup > p > .button[value="/friends"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="shaymin"]
    .menugroup
    > p
    > .button[value="/friends"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="shaymin"] .menugroup > p > .button[value="/friends"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="shaymin"] .menugroup > p > .button[value="resources"] {
    margin-bottom: 0px;
    background: #ffec4d33 !important;
}
body[style*="shaymin"] .menugroup > p > .button[value="resources"]::before {
    left: -24px;
    top: 18px;
    background-image: url("https://img.pokemondb.net/sprites/brilliant-diamond-shining-pearl/normal/alakazam.png");
    filter: drop-shadow(1px 0 0 #ffec4d) drop-shadow(-1px 0 0 #ffec4d)
        drop-shadow(0 1px 0 #ffec4d) drop-shadow(0 -1px 0 #ffec4d);
}
body[style*="shaymin"] .menugroup > p > .button[value="resources"]::after {
    left: 0;
    width: 40px;
    background: #ffec4d;
}
body[style*="shaymin"]
    .menugroup
    > p
    > .button[value="resources"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="shaymin"]
    .menugroup
    > p
    > .button[value="resources"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="shaymin"] .menugroup > p > .button[value="resources"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="shaymin"] .menugroup > p > .button[value="rooms"] {
    margin-bottom: 10px;
    background: #2b2b2ba1 !important;
}
body[style*="shaymin"] .menugroup > p > .button[value="rooms"]::before {
    left: -42px;
    top: 16px;
    transform-origin: center 55px !important;
    width: 90px;
    height: 90px;
    background-image: url("https://img.pokemondb.net/sprites/brilliant-diamond-shining-pearl/normal/chatot.png");
    filter: drop-shadow(1px 0 0 #2b2b2b) drop-shadow(-1px 0 0 #2b2b2b)
        drop-shadow(0 1px 0 #2b2b2b) drop-shadow(0 -1px 0 #2b2b2b);
}
body[style*="shaymin"] .menugroup > p > .button[value="rooms"]::after {
    left: 0;
    width: 40px;
    background: #2b2b2b;
}
body[style*="shaymin"] .menugroup > p > .button[value="rooms"]:hover::after {
    left: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="shaymin"] .menugroup > p > .button[value="rooms"]:hover::before {
    transform: translateY(-50%) scale(1.15);
}
body[style*="shaymin"] .menugroup > p > .button[value="rooms"]:hover {
    color: rgb(255 255 255 / 0.5) !important;
}
body[style*="shaymin"] .button.mainmenu1[name="search"] {
    background: #f1daf133 !important;
    margin-bottom: 0px;
    padding-top: 0 !important;
}
body[style*="shaymin"] .button.mainmenu1[name="search"]::before {
    transform: translateY(-50%) scaleX(-1);
    top: 5px;
    width: 95px;
    height: 95px;
    right: -57px;
    background-image: url("https://img.pokemondb.net/sprites/scarlet-violet/normal/mewtwo.png");
    filter: drop-shadow(1px 0 0 #f1daf1) drop-shadow(-1px 0 0 #f1daf1)
        drop-shadow(0 1px 0 #f1daf1) drop-shadow(0 -1px 0 #f1daf1);
}
body[style*="shaymin"] .button.mainmenu1[name="search"]::after {
    left: auto;
    right: 0;
    width: 0px;
    background: #f1daf1;
    border-radius: 0 6px 6px 0;
    clip-path: polygon(25% 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="shaymin"] .button.mainmenu1[name="search"]:hover::after {
    left: auto;
    right: 0;
    width: 100%;
    border-radius: 6px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
body[style*="shaymin"] .button.mainmenu1[name="search"]:hover::before {
    transform: translateY(-50%) scaleX(-1) scale(1.15);
}
body[style*="shaymin"] .button.mainmenu1[name="search"]:hover {
    color: rgb(0 0 0 / 0.5) !important;
}
body[style*="charizards"] .tabbar a.button.subtle-notifying,
body[style*="charizards"] .dark .tabbar a.button.subtle-notifying,
body[style*="charizards"] .tablist a.button.subtle-notifying {
    color: rgb(var(--red));
}
body[style*="charizards"] .tabbar a.button.notifying,
body[style*="charizards"] .dark .tabbar a.button.notifying,
body[style*="charizards"] .tablist a.button.notifying {
    background: rgb(var(--red) / calc(56 / 255 * 100%));
    border-color: rgb(var(--red) / 40%);
    color: rgb(var(--red));
}
body[style*="charizards"] .tabbar a.button.notifying:hover,
body[style*="charizards"] .dark .tabbar a.button.notifying:hover,
body[style*="charizards"] .tablist a.button.notifying:hover {
    background: rgb(var(--red) / calc(77 / 255 * 100%));
    border-color: rgb(var(--red) / calc(179 / 255 * 100%));
}
body[style*="charizards"] .tabbar a.button,
body[style*="charizards"] .dark .tabbar a.button {
    border-color: #99999926;
    background: #99999926;
    color: #ffffff;
}
body[style*="charizards"] .tabbar a.button:hover,
body[style*="charizards"] .tabbar a.button:active,
body[style*="charizards"] .tabbar a.button:focus-visible,
body[style*="charizards"] .dark .tabbar a.button:hover,
body[style*="charizards"] .dark .tabbar a.button:active {
    background: #9999994d;
    border-color: #9999994d;
}
body[style*="charizards"] .tabbar a.button.cur,
body[style*="charizards"] .tabbar a.button.cur:hover,
body[style*="charizards"] .dark .tabbar a.button.cur,
body[style*="charizards"] .dark .tabbar a.button.cur:hover {
    background: rgb(var(--red) / 40%);
    color: #ffffff;
    border-color: rgb(var(--red) / 40%);
}
body[style*="charizards"] .tabbar a.button.cur:focus-visible,
body[style*="charizards"] .tabbar a.button.cur:focus-visible:hover {
    background: rgb(var(--red));
}
body[style*="charizards"] .maintabbar .overflow .button {
    background: #263f59;
}
body[style*="charizards"] .maintabbar .overflow .button:hover,
body[style*="charizards"] .maintabbar .overflow .button:active,
body[style*="charizards"] .maintabbar .overflow .button:focus-visible {
    background: #1f334d;
}
body[style*="charizards"] .tablist .button.cur,
body[style*="charizards"] .tablist .button.cur:hover {
    background: rgb(var(--red) / 40%);
    color: #ffffff;
    border-color: rgb(var(--red) / 40%);
}
body[style*="charizards"] .tablist .button {
    border-color: #99999926;
}
body[style*="charizards"] .tablist .button:hover {
    background: #9999994d;
    border-color: #9999994d;
}
body[style*="charizards"] .button,
body[style*="charizards"] .dark .button {
    background-color: #99999926;
    color: #ffffff;
}
body[style*="charizards"] .button:hover,
body[style*="charizards"] .dark .button:hover,
body[style*="charizards"] .button:active,
body[style*="charizards"] .dark .button:active,
body[style*="charizards"] .button:focus-visible,
body[style*="charizards"] .dark .button:focus-visible {
    background-color: rgb(var(--red) / 60%);
    box-shadow: 0 0 10px rgb(var(--red) / 40%);
}
body[style*="charizards"] .button.disabled,
body[style*="charizards"] .dark .button.disabled,
body[style*="charizards"] .button.disabled:hover,
body[style*="charizards"] .dark .button.disabled:hover,
body[style*="charizards"] .button.disabled:active,
body[style*="charizards"] .dark .button.disabled:active,
body[style*="charizards"] .button:disabled,
body[style*="charizards"] .dark .button:disabled,
body[style*="charizards"] .button:disabled:hover,
body[style*="charizards"] .dark .button:disabled:hover,
body[style*="charizards"] .button:disabled:active,
body[style*="charizards"] .dark .button:disabled:active {
    background: #99999926;
    color: #ffffff;
}
body[style*="charizards"] .checkbox:hover,
body[style*="charizards"] .menugroup .checkbox:hover,
body[style*="charizards"] .dark .checkbox:hover {
    background-color: #99999926;
}
body[style*="charizards"] .checkbox:has(input:focus-visible) {
    background-color: #99999926;
}
body[style*="charizards"] input[type="checkbox"]:hover {
    background-color: rgb(var(--red) / calc(117 / 255 * 100%)) !important;
    border-color: rgb(var(--red)) !important;
}
body[style*="charizards"] input[type="checkbox"]:checked {
    background-color: rgb(var(--red)) !important;
    border-color: rgb(var(--red)) !important;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3.5 8l2.5 2.5 6-6' fill='none' stroke='%2300000080' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") !important;
}
body[style*="charizards"] input[type="checkbox"]:checked:hover {
    background-color: rgb(var(--red)) !important;
    border-color: rgb(var(--red)) !important;
}
body[style*="charizards"] input[type="checkbox"]:focus-visible {
    box-shadow: 0 0 0 3px rgb(var(--red) / calc(38 / 255 * 100%)) !important;
}
body[style*="charizards"] .closebutton:hover,
body[style*="charizards"] .dark .closebutton:hover,
body[style*="charizards"] .closebutton:active,
body[style*="charizards"] .closebutton:focus-visible {
    color: rgb(var(--red));
}
body[style*="charizards"] .ps-popup .userdetails .rooms span {
    display: inline-block !important;
    max-width: 55% !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    vertical-align: middle !important;
}
body[style*="charizards"] a,
body[style*="charizards"] .dark a,
body[style*="charizards"] a.ilink,
body[style*="charizards"] .dark a.ilink {
    color: rgb(var(--red));
    outline: 2px solid transparent;
}
body[style*="charizards"]
    a:not(.button, body[style*="charizards"] .blocklink):visited,
body[style*="charizards"]
    .dark
    a:not(.button, body[style*="charizards"] .blocklink):visited,
body[style*="charizards"] a.ilink.yours,
body[style*="charizards"] a.ilink:hover {
    color: rgb(var(--red));
}
body[style*="charizards"] a:focus-visible {
    outline: 2px solid currentColor;
    border-radius: 2px;
    transition: outline 0.15s;
}
body[style*="charizards"] a.subtle,
body[style*="charizards"] button.subtle,
body[style*="charizards"] .dark button.subtle {
    color: hsl(0, 0%, 100%);
    background: none;
    transition: 0.15s;
}
body[style*="charizards"] a.subtle:hover,
body[style*="charizards"] button.subtle:hover,
body[style*="charizards"] a.subtle:focus-visible,
body[style*="charizards"] button.subtle:focus-visible {
    color: rgb(var(--red));
    text-decoration: none;
    outline: transparent;
}
body[style*="charizards"] .option,
body[style*="charizards"] .dark .option {
    color: hsl(0, 0%, 100%);
    border-radius: 6px;
}
body[style*="charizards"] .option:hover,
body[style*="charizards"] .dark .option:hover,
body[style*="charizards"] .option:focus-visible {
    background-color: hsla(0, 0%, 60%, 0.15);
    border-color: rgb(var(--red) / 40%);
}
body[style*="charizards"] .option.cur,
body[style*="charizards"] .dark .option.cur {
    background-color: hsla(0, 0%, 60%, 0.15);
    border-color: rgb(var(--red) / 40%);
}
body[style*="charizards"] .option.cur:hover,
body[style*="charizards"] .dark .option.cur:hover,
body[style*="charizards"] .option.cur:focus-visible {
    background-color: hsla(0, 0%, 60%, 0.3);
    border-color: rgb(var(--red) / 60%);
}
body[style*="charizards"] .popupmenu .option {
    border: none;
    color: hsl(0, 0%, 100%);
    border-radius: 0 6px 6px 0;
    border-left: 2px solid transparent;
    display: flex;
    align-items: center;
    margin-top: 2px;
}
body[style*="charizards"] .popupmenu .option:not([name="moveHere"]) {
    justify-content: space-between;
}
body[style*="charizards"] .popupmenu .option:hover,
body[style*="charizards"] .popupmenu .option.cur {
    border-color: rgb(var(--red) / 40%);
}
body[style*="charizards"] .avatarlist .option {
    border: none;
}
body[style*="charizards"] .formlist .option {
    border: none;
}
body[style*="charizards"] .bglist .option {
    text-align: center;
    border: none;
    padding: 4px;
}
body[style*="charizards"] .bglist button span,
body[style*="charizards"] .bglist .option strong {
    border-radius: inherit;
}
body[style*="charizards"]
    .bglist
    .option
    strong[style="background:#888888;color:white;padding:16px 18px;display:block;font-size:12pt"] {
    background: rgb(var(--red) / 40%) !important;
}
body[style*="charizards"]
    .ps-popup[style*="max-width: 448px; position: absolute; margin: 0px;"] {
    max-width: 455px !important;
}
body[style*="charizards"]
    .bgstatus
    strong[style="background:red;color:white;padding:1px 4px;border-radius:4px;display:block"] {
    background: hsl(330, 50%, 50%) !important;
    border-radius: 6px !important;
}
body[style*="charizards"] .menugroup {
    background: radial-gradient(
        hsla(210, 20%, 10%, 0.6),
        hsla(210, 20%, 10%, 0.7)
    );
    backdrop-filter: blur(35px) saturate(180%);
    border: 1px solid hsla(0, 0%, 60%, 0.15);
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
    border-radius: 6px;
    text-shadow: none;
    color: hsl(0, 0%, 100%);
}
@media (max-width: 895px) {
    body[style*="charizards"] .rightmenu {
        padding-bottom: 0;
    }
}
body[style*="charizards"] .tiny-layout .rightmenu,
body[style*="charizards"] .mainmenu {
    padding-bottom: 0;
}
body[style*="charizards"] .leftmenu,
body[style*="charizards"] .tiny-layout .leftmenu {
    padding-top: 6px;
}
body[style*="charizards"] .menugroup {
    margin: 0 6px 6px 6px;
}
body[style*="charizards"] .tiny-layout .menugroup {
    margin: 0 auto 6px;
}
body[style*="charizards"] .activitymenu {
    left: 284px;
    top: 6px;
}
body[style*="charizards"] .pm-window {
    margin: 0 -24px 6px 0;
}
body[style*="charizards"] .tiny-layout .pm-window {
    margin: 0 -1px 6px -1px;
}
body[style*="charizards"] .tiny-layout .activitymenu {
    padding-bottom: 0;
}
body[style*="charizards"] .rightmenu {
    top: 6px;
}
body[style*="charizards"] .rightmenu {
    top: 6px;
    width: 270px;
    right: 6px;
}
body[style*="charizards"] .rightmenu > .menugroup {
    margin: 0px;
}
body[style*="charizards"] .pm-window,
body[style*="charizards"] .dark .pm-window {
    border-radius: 6px;
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
    background: radial-gradient(
        hsla(210, 20%, 10%, 0.6),
        hsla(210, 20%, 10%, 0.7)
    );
    backdrop-filter: blur(35px) saturate(180%);
}
body[style*="charizards"] .pm-window h3,
body[style*="charizards"] .dark .pm-window h3 {
    background: none;
    color: hsl(0, 0%, 60%);
    border: 1px solid hsla(0, 0%, 60%, 0.15);
    border-radius: 6px 6px 0 0;
}
body[style*="charizards"] .pm-window h3 small {
    color: hsl(0, 0%, 60%);
}
body[style*="charizards"] .pm-window h3.pm-minimized {
    border-radius: 6px;
}
body[style*="charizards"] .pm-window h3,
body[style*="charizards"] .minimizebutton,
body[style*="charizards"] .closebutton {
    transition: color 0.15s;
}
body[style*="charizards"] .minimizebutton:hover,
body[style*="charizards"] .closebutton:hover,
body[style*="charizards"] .minimizebutton:focus-visible,
body[style*="charizards"] .closebutton:focus-visible {
    background: none;
}
body[style*="charizards"] .pm-window h3:hover,
body[style*="charizards"] .dark .pm-window h3:hover {
    color: hsl(0, 0%, 100%);
}
body[style*="charizards"] .pm-window h3.pm-notifying,
body[style*="charizards"] .dark .pm-window h3.pm-notifying {
    border-color: hsla(0, 0%, 60%, 0.15);
    background: none;
    box-shadow: inset 0 0 0 500px rgb(var(--red) / 40%);
}
body[style*="charizards"] .pm-window h3.pm-notifying:hover,
body[style*="charizards"] .dark .pm-window h3.pm-notifying:hover {
    border-color: hsla(0, 0%, 60%, 0.15);
    background: none;
}
body[style*="charizards"] .header-username,
body[style*="charizards"] .closebutton,
body[style*="charizards"] .minimizebutton,
body[style*="charizards"] .dark .closebutton,
body[style*="charizards"] .dark .minimizebutton {
    color: hsl(0, 0%, 60%);
}
body[style*="charizards"] .minimizebutton:hover,
body[style*="charizards"] .pm-window h3:hover .minimizebutton,
body[style*="charizards"] .dark .minimizebutton:hover,
body[style*="charizards"] .dark .pm-window h3:hover .minimizebutton {
    color: hsl(0, 0%, 100%);
}
body[style*="charizards"] .pm-window h3 .closebutton:hover + .minimizebutton {
    color: hsl(0, 0%, 60%) !important;
}
body[style*="charizards"] .closebutton:hover,
body[style*="charizards"] .dark .closebutton:hover,
body[style*="charizards"] .closebutton:active,
body[style*="charizards"] .closebutton:focus-visible {
    color: rgb(var(--red));
    outline: transparent;
}
body[style*="charizards"] .minimizebutton:active {
    color: hsl(0, 0%, 100%);
}
body[style*="charizards"] .pm-window.focused h3,
body[style*="charizards"] .pm-window.focused h3:hover,
body[style*="charizards"] .dark .pm-window.focused h3,
body[style*="charizards"] .dark .pm-window.focused h3:hover {
    background: none;
    color: hsl(0, 0%, 100%);
}
body[style*="charizards"] .pm-window.focused h3,
body[style*="charizards"] .pm-window.focused .pm-log,
body[style*="charizards"] .pm-window.focused .pm-log-add,
body[style*="charizards"] .dark .pm-window.focused h3,
body[style*="charizards"] .dark .pm-window.focused .pm-log,
body[style*="charizards"] .dark .pm-window.focused .pm-log-add {
    border-color: hsla(0, 0%, 60%, 0.15);
}
body[style*="charizards"] .pm-log,
body[style*="charizards"] .dark .pm-log {
    color: hsl(0, 0%, 100%);
    background: none;
    border-color: hsla(0, 0%, 60%, 0.15);
    backdrop-filter: none;
}
body[style*="charizards"] .news-embed .pm-log {
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
}
body[style*="charizards"] .newsentry,
body[style*="charizards"] .dark .newsentry {
    border-bottom: 1px solid hsla(0, 0%, 60%, 0.15);
}
body[style*="charizards"] .newsentry:last-child {
    border-radius: inherit;
}
body[style*="charizards"] .unread {
    background: none;
    box-shadow: inset 0 0 0 500px rgb(var(--red) / 40%);
}
body[style*="charizards"] .pm-log-add,
body[style*="charizards"] .dark .pm-log-add {
    background: none;
    border-color: hsla(0, 0%, 60%, 0.15);
    padding: 4px 4px 4px 0px;
}
body[style*="charizards"] .pm-buttonbar button,
body[style*="charizards"] .dark .pm-buttonbar button {
    background: none;
    border: none;
    color: hsl(0, 0%, 60%);
    transition: 0.15s;
}
body[style*="charizards"] .pm-buttonbar button:hover,
body[style*="charizards"] .dark .pm-buttonbar button:hover {
    background: none;
    color: hsl(0, 0%, 100%);
}
body[style*="charizards"] .challenge {
    background: none;
    border-color: hsla(0, 0%, 60%, 0.15);
    border-top: none;
    color: hsl(0, 0%, 100%);
    margin-top: 0;
}
body[style*="charizards"] .pm-minimized + .challenge {
    display: none;
}
body[style*="charizards"]
    div[style="max-height: 222px ; overflow-y: auto ; color: #fff ; text-shadow: 1px 0 0 #000 , 0 -1px 0 #000 , 0 1px 0 #000 , -1px 0 0 #000"] {
    text-shadow: none !important;
    color: hsl(0, 0%, 100%) !important;
}
body[style*="charizards"]
    table[style="border-collapse: collapse ; border: 1px solid #6688aa ; background-color: rgba(40 , 40 , 60 , 1) ; border-radius: 10px"] {
    background: none !important;
    border-radius: 0 !important;
    border-color: hsl(0, 0%, 60%) !important;
}
body[style*="charizards"]
    th[style="border-bottom: 1px solid #94b8b8 ; padding: 5px"] {
    border-color: hsl(0, 0%, 60%);
}
body[style*="charizards"]
    tr[style="width: auto ; background: rgb(35 , 35 , 100) ; background-attachment: fixed ; font-size: 14px"] {
    background: rgb(var(--red) / 40%) !important;
}
body[style*="charizards"]
    tr[style="width: auto ; background: rgb(80 , 80 , 110) ; background-attachment: fixed ; font-size: 14px"] {
    background: hsla(330, 50%, 50%, 0.4) !important;
}
body[style*="charizards"] .ladder table,
.ladder td,
.ladder th {
    border-color: hsl(0, 0%, 60%);
}
body[style*="charizards"] .ladder th {
    background: hsla(0, 0%, 60%, 0.3);
    color: hsl(0, 0%, 100%);
}
body[style*="charizards"] .ladder span {
    color: hsl(0, 0%, 60%);
}
body[style*="charizards"] .folder.cur .selectFolder,
body[style*="charizards"] .folder.cur .selectFolder:hover,
body[style*="charizards"] .folder.cur .selectFolder:active,
body[style*="charizards"] .dark .folder.cur .selectFolder,
body[style*="charizards"] .dark .folder.cur .selectFolder:hover,
body[style*="charizards"] .dark .folder.cur .selectFolder:active {
    background: rgb(var(--red) / 40%);
    color: hsl(0, 0%, 100%);
    border: 2px solid rgb(var(--red) / 40%);
    padding-top: 0px;
    padding-left: 7px;
    height: 35px;
}
body[style*="charizards"] .selectFolder a,
body[style*="charizards"] .dark .selectFolder a,
body[style*="charizards"] .selectFolder a:visited,
body[style*="charizards"] .dark .selectFolder a:visited {
    color: rgb(var(--red));
}
body[style*="charizards"] .setchart-nickname,
body[style*="charizards"] .dark .setchart-nickname {
    background: #816ca5;
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
}
body[style*="charizards"] .setchart,
body[style*="charizards"] .dark .setchart {
    border-color: transparent;
    background-color: #816ca5;
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
}
body[style*="charizards"] .ps-room .setchart .textbox,
body[style*="charizards"] .dark .setchart .textbox,
body[style*="charizards"] .ps-room .setchart-nickname .textbox,
body[style*="charizards"] .dark .setchart-nickname .textbox {
    background: #00000085;
    box-shadow: inset 0 2px 3px hsla(0, 0%, 0%, 0.1);
}
body[style*="charizards"] .ps-room .setchart .textbox:hover,
body[style*="charizards"] .dark .setchart .textbox:hover,
body[style*="charizards"] .ps-room .setchart-nickname .textbox:hover,
body[style*="charizards"] .dark .setchart-nickname .textbox:hover {
    background: #00000052;
    box-shadow: inset 0 2px 3px hsla(0, 0%, 0%, 0.1);
}
body[style*="charizards"] .ps-room .setchart .textbox:focus,
body[style*="charizards"] .dark .setchart .textbox:focus,
body[style*="charizards"] .ps-room .setchart-nickname .textbox:focus,
body[style*="charizards"] .dark .setchart-nickname .textbox:focus {
    background: #0000004f;
    box-shadow: inset 0 2px 3px hsla(0, 0%, 0%, 0.1);
}
@keyframes shift-solid {
    0% {
        background: #0000004f;
    }
    50% {
        background: #0000009c;
    }
    100% {
        background: #0000004f;
    }
}
body[style*="charizards"] .setchart .textbox:disabled:hover,
body[style*="charizards"] .dark .setchart .textbox:disabled:hover,
body[style*="charizards"] .setchart-nickname .textbox:disabled:hover,
body[style*="charizards"] .dark .setchart-nickname .textbox:disabled:hover {
    background: #6f5b00;
}
body[style*="charizards"] .setcol-icon label,
body[style*="charizards"] .dark .setcol-icon label {
    text-shadow: #816ca5 1px 1px 0, #816ca5 1px -1px 0, #816ca5 -1px 1px 0,
        #816ca5 -1px -1px 0;
}
body[style*="charizards"] .setchart input.incomplete {
    color: #816ca5;
    border-color: transparent;
}
body[style*="charizards"] .utilichart h3,
body[style*="charizards"] .dexentry h3,
body[style*="charizards"] .resultheader h3,
body[style*="charizards"] .dark .utilichart h3,
body[style*="charizards"] .dark .dexentry h3,
body[style*="charizards"] .dark .resultheader h3 {
    font-family: "Lexend", sans-serif !important;
    color: hsl(0, 0%, 100%);
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
    text-shadow: none;
    background: #816ca5;
    border: 2px solid transparent;
    border-radius: 6px;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    inset: 0;
    width: 685px;
    box-sizing: border-box;
}
body[style*="charizards"] .utilichart .sortrow {
    border: none;
    border-radius: 6px;
    background: #816ca5;
    height: 100%;
    width: 685px;
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
}
body[style*="charizards"] .utilichart .sortcol.cur,
body[style*="charizards"] .utilichart .sortcol:hover,
body[style*="charizards"] .utilichart .sortcol:focus-visible,
body[style*="charizards"] .utilichart .sortcol.numsortcol.cur,
body[style*="charizards"] .utilichart .sortcol.numsortcol.cur:hover {
    background: rgb(var(--red) / 80%);
    outline: transparent;
    border-radius: 4px;
    height: 25px;
}
body[style*="charizards"] .utilichart .sortcol.cur:focus-visible {
    background: rgb(var(--red) / 67%);
}
body[style*="charizards"] .utilichart b {
    color: rgb(var(--red));
}
body[style*="charizards"] .utilichart .filtercol em {
    color: rgb(var(--red));
    border-color: transparent;
    border-radius: 6px;
    background: rgb(var(--red) / 20%);
}
body[style*="charizards"] .utilichart .filter:hover i,
body[style*="charizards"] .searchboxwrapper .filter:hover i,
body[style*="charizards"] .utilichart .filter:focus-visible i,
body[style*="charizards"] .searchboxwrapper .filter:focus-visible i {
    color: rgb(var(--red));
}
body[style*="charizards"] .teambuilder-clipboard-data,
body[style*="charizards"] .dark .teambuilder-clipboard-data {
    right: auto;
    border: none;
    background: #816ca5;
    color: hsl(0, 0%, 100%);
    transition: 0.15s;
    border-radius: 6px;
}
body[style*="charizards"] .teambuilder-clipboard-data:hover {
    background: rgb(var(--red) / 80%);
    border: none;
}
body[style*="charizards"] .teambar button:hover,
body[style*="charizards"] .dark .teambar button:hover,
body[style*="charizards"] .teambar button:focus-visible {
    background: none;
    border: none;
    border-bottom: 2px solid rgb(var(--red) / 40%);
    height: 50px;
    transform: translateY(0px);
}
body[style*="charizards"] .teambar button:disabled,
body[style*="charizards"] .teambar button:disabled:hover,
body[style*="charizards"] .teambar button:disabled:active,
body[style*="charizards"] .dark .teambar button:disabled,
body[style*="charizards"] .dark .teambar button:disabled:hover,
body[style*="charizards"] .dark .teambar button:disabled:active {
    background: none;
    border-color: rgb(var(--red));
    opacity: 1;
    transform: translateY(0px);
}
body[style*="charizards"] .blocklink:hover,
body[style*="charizards"] .dark .blocklink:hover,
body[style*="charizards"] .blocklink:focus-visible {
    background: rgb(var(--red) / 40%);
    color: hsl(0, 0%, 100%);
    border: 2px solid rgb(var(--red) / 40%);
    outline: transparent;
}
body[style*="charizards"] .select:hover,
body[style*="charizards"] .team:hover,
body[style*="charizards"] .dark .select:hover,
body[style*="charizards"] .dark .team:hover,
body[style*="charizards"] .select:active,
body[style*="charizards"] .team:active,
body[style*="charizards"] .dark .select:active,
body[style*="charizards"] .dark .team:active,
body[style*="charizards"] .select:focus-visible,
body[style*="charizards"] .team:focus-visible,
body[style*="charizards"] .dark .select:hover,
body[style*="charizards"] .dark .select:hover .team,
body[style*="charizards"] .dark a.team:hover,
body[style*="charizards"] .dark button.team:hover {
    background: rgb(var(--red) / 60%);
    color: hsl(0, 0%, 100%);
    box-shadow: 0 0 10px rgb(var(--red) / 40%);
}
body[style*="charizards"] .popupmenu strong,
.popupmenu h3 {
    color: rgb(var(--red)) !important;
}
body[style*="charizards"] .popupmenu i {
    color: rgb(var(--red)) !important;
    text-shadow: none !important;
}
body[style*="charizards"] i.subtle {
    color: hsla(0, 0%, 60%, 0.15) !important;
    opacity: 1 !important;
    transition: 0.15s;
}
body[style*="charizards"] i.subtle:hover {
    color: rgb(var(--red) / 40%) !important;
    opacity: 1 !important;
}
body[style*="charizards"] input[type="range"]::-webkit-slider-thumb {
    background: rgb(var(--red));
}
body[style*="charizards"] input[type="range"]:hover::-webkit-slider-thumb {
    background: rgb(var(--red));
    border-color: rgb(var(--red));
}
body[style*="charizards"] input[type="range"]:focus::-webkit-slider-thumb {
    border-color: rgb(var(--red));
}
body[style*="charizards"] input[type="range"]:active::-webkit-slider-thumb {
    border-color: rgb(var(--red));
    box-shadow: 0 0 0 3px rgb(var(--red) / 40%);
}
body[style*="charizards"] button[name="copySet"]:hover::before,
body[style*="charizards"] button[name="importSet"]:hover::before,
body[style*="charizards"] button[name="moveSet"]:hover::before,
body[style*="charizards"] button[name="deleteSet"]:hover::before,
body[style*="charizards"] button[name="edit"]:hover::before,
body[style*="charizards"] button[name="duplicate"]:hover::before,
body[style*="charizards"] button[name="delete"]:hover::before {
    background-color: rgb(var(--red)) !important;
}
body[style*="horizon"] .tabbar a.button.subtle-notifying,
body[style*="horizon"] .dark .tabbar a.button.subtle-notifying,
body[style*="horizon"] .tablist a.button.subtle-notifying {
    color: rgb(var(--green));
}
body[style*="horizon"] .tabbar a.button.notifying,
body[style*="horizon"] .dark .tabbar a.button.notifying,
body[style*="horizon"] .tablist a.button.notifying {
    background: rgb(var(--green) / calc(56 / 255 * 100%));
    border-color: rgb(var(--green) / 40%);
    color: rgb(var(--green));
}
body[style*="horizon"] .tabbar a.button.notifying:hover,
body[style*="horizon"] .dark .tabbar a.button.notifying:hover,
body[style*="horizon"] .tablist a.button.notifying:hover {
    background: rgb(var(--green) / calc(77 / 255 * 100%));
    border-color: rgb(var(--green) / calc(179 / 255 * 100%));
}
body[style*="horizon"] .tabbar a.button,
body[style*="horizon"] .dark .tabbar a.button {
    border-color: #99999926;
    background: #99999926;
    color: #ffffff;
}
body[style*="horizon"] .tabbar a.button:hover,
body[style*="horizon"] .tabbar a.button:active,
body[style*="horizon"] .tabbar a.button:focus-visible,
body[style*="horizon"] .dark .tabbar a.button:hover,
body[style*="horizon"] .dark .tabbar a.button:active {
    background: #9999994d;
    border-color: #9999994d;
}
body[style*="horizon"] .tabbar a.button.cur,
body[style*="horizon"] .tabbar a.button.cur:hover,
body[style*="horizon"] .dark .tabbar a.button.cur,
body[style*="horizon"] .dark .tabbar a.button.cur:hover {
    background: rgb(var(--green) / 40%);
    color: #ffffff;
    border-color: rgb(var(--green) / 40%);
}
body[style*="horizon"] .tabbar a.button.cur:focus-visible,
body[style*="horizon"] .tabbar a.button.cur:focus-visible:hover {
    background: rgb(var(--green));
}
body[style*="horizon"] .maintabbar .overflow .button {
    background: #263f59;
}
body[style*="horizon"] .maintabbar .overflow .button:hover,
body[style*="horizon"] .maintabbar .overflow .button:active,
body[style*="horizon"] .maintabbar .overflow .button:focus-visible {
    background: #1f334d;
}
body[style*="horizon"] .tablist .button.cur,
body[style*="horizon"] .tablist .button.cur:hover {
    background: rgb(var(--green) / 40%);
    color: #ffffff;
    border-color: rgb(var(--green) / 40%);
}
body[style*="horizon"] .tablist .button {
    border-color: #99999926;
}
body[style*="horizon"] .tablist .button:hover {
    background: #9999994d;
    border-color: #9999994d;
}
body[style*="horizon"] .button,
body[style*="horizon"] .dark .button {
    background-color: #99999926;
    color: #ffffff;
}
body[style*="horizon"] .button:hover,
body[style*="horizon"] .dark .button:hover,
body[style*="horizon"] .button:active,
body[style*="horizon"] .dark .button:active,
body[style*="horizon"] .button:focus-visible,
body[style*="horizon"] .dark .button:focus-visible {
    background-color: rgb(var(--green) / 60%);
    box-shadow: 0 0 10px rgb(var(--green) / 40%);
}
body[style*="horizon"] .button.disabled,
body[style*="horizon"] .dark .button.disabled,
body[style*="horizon"] .button.disabled:hover,
body[style*="horizon"] .dark .button.disabled:hover,
body[style*="horizon"] .button.disabled:active,
body[style*="horizon"] .dark .button.disabled:active,
body[style*="horizon"] .button:disabled,
body[style*="horizon"] .dark .button:disabled,
body[style*="horizon"] .button:disabled:hover,
body[style*="horizon"] .dark .button:disabled:hover,
body[style*="horizon"] .button:disabled:active,
body[style*="horizon"] .dark .button:disabled:active {
    background: #99999926;
    color: #ffffff;
}
body[style*="horizon"] .checkbox:hover,
body[style*="horizon"] .menugroup .checkbox:hover,
body[style*="horizon"] .dark .checkbox:hover {
    background-color: #99999926;
}
body[style*="horizon"] .checkbox:has(input:focus-visible) {
    background-color: #99999926;
}
body[style*="horizon"] input[type="checkbox"]:hover {
    background-color: rgb(var(--green) / calc(117 / 255 * 100%)) !important;
    border-color: rgb(var(--green)) !important;
}
body[style*="horizon"] input[type="checkbox"]:checked {
    background-color: rgb(var(--green)) !important;
    border-color: rgb(var(--green)) !important;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3.5 8l2.5 2.5 6-6' fill='none' stroke='%2300000080' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") !important;
}
body[style*="horizon"] input[type="checkbox"]:checked:hover {
    background-color: rgb(var(--green)) !important;
    border-color: rgb(var(--green)) !important;
}
body[style*="horizon"] input[type="checkbox"]:focus-visible {
    box-shadow: 0 0 0 3px rgb(var(--green) / calc(38 / 255 * 100%)) !important;
}
body[style*="horizon"] .closebutton:hover,
body[style*="horizon"] .dark .closebutton:hover,
body[style*="horizon"] .closebutton:active,
body[style*="horizon"] .closebutton:focus-visible {
    color: rgb(var(--green));
}
body[style*="horizon"] .ps-popup .userdetails .rooms span {
    display: inline-block !important;
    max-width: 55% !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    vertical-align: middle !important;
}
body[style*="horizon"] a,
body[style*="horizon"] .dark a,
body[style*="horizon"] a.ilink,
body[style*="horizon"] .dark a.ilink {
    color: rgb(var(--green));
    outline: 2px solid transparent;
}
body[style*="horizon"]
    a:not(.button, body[style*="horizon"] .blocklink):visited,
body[style*="horizon"]
    .dark
    a:not(.button, body[style*="horizon"] .blocklink):visited,
body[style*="horizon"] a.ilink.yours,
body[style*="horizon"] a.ilink:hover {
    color: rgb(var(--green));
}
body[style*="horizon"] a:focus-visible {
    outline: 2px solid currentColor;
    border-radius: 2px;
    transition: outline 0.15s;
}
body[style*="horizon"] a.subtle,
body[style*="horizon"] button.subtle,
body[style*="horizon"] .dark button.subtle {
    color: hsl(0, 0%, 100%);
    background: none;
    transition: 0.15s;
}
body[style*="horizon"] a.subtle:hover,
body[style*="horizon"] button.subtle:hover,
body[style*="horizon"] a.subtle:focus-visible,
body[style*="horizon"] button.subtle:focus-visible {
    color: rgb(var(--green));
    text-decoration: none;
    outline: transparent;
}
body[style*="horizon"] .option,
body[style*="horizon"] .dark .option {
    color: hsl(0, 0%, 100%);
    border-radius: 6px;
}
body[style*="horizon"] .option:hover,
body[style*="horizon"] .dark .option:hover,
body[style*="horizon"] .option:focus-visible {
    background-color: hsla(0, 0%, 60%, 0.15);
    border-color: rgb(var(--green) / 40%);
}
body[style*="horizon"] .option.cur,
body[style*="horizon"] .dark .option.cur {
    background-color: hsla(0, 0%, 60%, 0.15);
    border-color: rgb(var(--green) / 40%);
}
body[style*="horizon"] .option.cur:hover,
body[style*="horizon"] .dark .option.cur:hover,
body[style*="horizon"] .option.cur:focus-visible {
    background-color: hsla(0, 0%, 60%, 0.3);
    border-color: rgb(var(--green) / 60%);
}
body[style*="horizon"] .popupmenu .option {
    border: none;
    color: hsl(0, 0%, 100%);
    border-radius: 0 6px 6px 0;
    border-left: 2px solid transparent;
    display: flex;
    align-items: center;
    margin-top: 2px;
}
body[style*="horizon"] .popupmenu .option:not([name="moveHere"]) {
    justify-content: space-between;
}
body[style*="horizon"] .popupmenu .option:hover,
body[style*="horizon"] .popupmenu .option.cur {
    border-color: rgb(var(--green) / 40%);
}
body[style*="horizon"] .avatarlist .option {
    border: none;
}
body[style*="horizon"] .formlist .option {
    border: none;
}
body[style*="horizon"] .bglist .option {
    text-align: center;
    border: none;
    padding: 4px;
}
body[style*="horizon"] .bglist button span,
body[style*="horizon"] .bglist .option strong {
    border-radius: inherit;
}
body[style*="horizon"]
    .bglist
    .option
    strong[style="background:#888888;color:white;padding:16px 18px;display:block;font-size:12pt"] {
    background: rgb(var(--green) / 40%) !important;
}
body[style*="horizon"]
    .ps-popup[style*="max-width: 448px; position: absolute; margin: 0px;"] {
    max-width: 455px !important;
}
body[style*="horizon"]
    .bgstatus
    strong[style="background:green;color:white;padding:1px 4px;border-radius:4px;display:block"] {
    background: hsl(330, 50%, 50%) !important;
    border-radius: 6px !important;
}
body[style*="horizon"] .menugroup {
    background: radial-gradient(
        hsla(210, 20%, 10%, 0.6),
        hsla(210, 20%, 10%, 0.7)
    );
    backdrop-filter: blur(35px) saturate(180%);
    border: 1px solid hsla(0, 0%, 60%, 0.15);
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
    border-radius: 6px;
    text-shadow: none;
    color: hsl(0, 0%, 100%);
}
@media (max-width: 895px) {
    body[style*="horizon"] .rightmenu {
        padding-bottom: 0;
    }
}
body[style*="horizon"] .tiny-layout .rightmenu,
body[style*="horizon"] .mainmenu {
    padding-bottom: 0;
}
body[style*="horizon"] .leftmenu,
body[style*="horizon"] .tiny-layout .leftmenu {
    padding-top: 6px;
}
body[style*="horizon"] .menugroup {
    margin: 0 6px 6px 6px;
}
body[style*="horizon"] .tiny-layout .menugroup {
    margin: 0 auto 6px;
}
body[style*="horizon"] .activitymenu {
    left: 284px;
    top: 6px;
}
body[style*="horizon"] .pm-window {
    margin: 0 -24px 6px 0;
}
body[style*="horizon"] .tiny-layout .pm-window {
    margin: 0 -1px 6px -1px;
}
body[style*="horizon"] .tiny-layout .activitymenu {
    padding-bottom: 0;
}
body[style*="horizon"] .rightmenu {
    top: 6px;
}
body[style*="horizon"] .rightmenu {
    top: 6px;
    width: 270px;
    right: 6px;
}
body[style*="horizon"] .rightmenu > .menugroup {
    margin: 0px;
}
body[style*="horizon"] .pm-window,
body[style*="horizon"] .dark .pm-window {
    border-radius: 6px;
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
    background: radial-gradient(
        hsla(210, 20%, 10%, 0.6),
        hsla(210, 20%, 10%, 0.7)
    );
    backdrop-filter: blur(35px) saturate(180%);
}
body[style*="horizon"] .pm-window h3,
body[style*="horizon"] .dark .pm-window h3 {
    background: none;
    color: hsl(0, 0%, 60%);
    border: 1px solid hsla(0, 0%, 60%, 0.15);
    border-radius: 6px 6px 0 0;
}
body[style*="horizon"] .pm-window h3 small {
    color: hsl(0, 0%, 60%);
}
body[style*="horizon"] .pm-window h3.pm-minimized {
    border-radius: 6px;
}
body[style*="horizon"] .pm-window h3,
body[style*="horizon"] .minimizebutton,
body[style*="horizon"] .closebutton {
    transition: color 0.15s;
}
body[style*="horizon"] .minimizebutton:hover,
body[style*="horizon"] .closebutton:hover,
body[style*="horizon"] .minimizebutton:focus-visible,
body[style*="horizon"] .closebutton:focus-visible {
    background: none;
}
body[style*="horizon"] .pm-window h3:hover,
body[style*="horizon"] .dark .pm-window h3:hover {
    color: hsl(0, 0%, 100%);
}
body[style*="horizon"] .pm-window h3.pm-notifying,
body[style*="horizon"] .dark .pm-window h3.pm-notifying {
    border-color: hsla(0, 0%, 60%, 0.15);
    background: none;
    box-shadow: inset 0 0 0 500px rgb(var(--green) / 40%);
}
body[style*="horizon"] .pm-window h3.pm-notifying:hover,
body[style*="horizon"] .dark .pm-window h3.pm-notifying:hover {
    border-color: hsla(0, 0%, 60%, 0.15);
    background: none;
}
body[style*="horizon"] .header-username,
body[style*="horizon"] .closebutton,
body[style*="horizon"] .minimizebutton,
body[style*="horizon"] .dark .closebutton,
body[style*="horizon"] .dark .minimizebutton {
    color: hsl(0, 0%, 60%);
}
body[style*="horizon"] .minimizebutton:hover,
body[style*="horizon"] .pm-window h3:hover .minimizebutton,
body[style*="horizon"] .dark .minimizebutton:hover,
body[style*="horizon"] .dark .pm-window h3:hover .minimizebutton {
    color: hsl(0, 0%, 100%);
}
body[style*="horizon"] .pm-window h3 .closebutton:hover + .minimizebutton {
    color: hsl(0, 0%, 60%) !important;
}
body[style*="horizon"] .closebutton:hover,
body[style*="horizon"] .dark .closebutton:hover,
body[style*="horizon"] .closebutton:active,
body[style*="horizon"] .closebutton:focus-visible {
    color: rgb(var(--green));
    outline: transparent;
}
body[style*="horizon"] .minimizebutton:active {
    color: hsl(0, 0%, 100%);
}
body[style*="horizon"] .pm-window.focused h3,
body[style*="horizon"] .pm-window.focused h3:hover,
body[style*="horizon"] .dark .pm-window.focused h3,
body[style*="horizon"] .dark .pm-window.focused h3:hover {
    background: none;
    color: hsl(0, 0%, 100%);
}
body[style*="horizon"] .pm-window.focused h3,
body[style*="horizon"] .pm-window.focused .pm-log,
body[style*="horizon"] .pm-window.focused .pm-log-add,
body[style*="horizon"] .dark .pm-window.focused h3,
body[style*="horizon"] .dark .pm-window.focused .pm-log,
body[style*="horizon"] .dark .pm-window.focused .pm-log-add {
    border-color: hsla(0, 0%, 60%, 0.15);
}
body[style*="horizon"] .pm-log,
body[style*="horizon"] .dark .pm-log {
    color: hsl(0, 0%, 100%);
    background: none;
    border-color: hsla(0, 0%, 60%, 0.15);
    backdrop-filter: none;
}
body[style*="horizon"] .news-embed .pm-log {
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
}
body[style*="horizon"] .newsentry,
body[style*="horizon"] .dark .newsentry {
    border-bottom: 1px solid hsla(0, 0%, 60%, 0.15);
}
body[style*="horizon"] .newsentry:last-child {
    border-radius: inherit;
}
body[style*="horizon"] .unread {
    background: none;
    box-shadow: inset 0 0 0 500px rgb(var(--green) / 40%);
}
body[style*="horizon"] .pm-log-add,
body[style*="horizon"] .dark .pm-log-add {
    background: none;
    border-color: hsla(0, 0%, 60%, 0.15);
    padding: 4px 4px 4px 0px;
}
body[style*="horizon"] .pm-buttonbar button,
body[style*="horizon"] .dark .pm-buttonbar button {
    background: none;
    border: none;
    color: hsl(0, 0%, 60%);
    transition: 0.15s;
}
body[style*="horizon"] .pm-buttonbar button:hover,
body[style*="horizon"] .dark .pm-buttonbar button:hover {
    background: none;
    color: hsl(0, 0%, 100%);
}
body[style*="horizon"] .challenge {
    background: none;
    border-color: hsla(0, 0%, 60%, 0.15);
    border-top: none;
    color: hsl(0, 0%, 100%);
    margin-top: 0;
}
body[style*="horizon"] .pm-minimized + .challenge {
    display: none;
}
body[style*="horizon"]
    div[style="max-height: 222px ; overflow-y: auto ; color: #fff ; text-shadow: 1px 0 0 #000 , 0 -1px 0 #000 , 0 1px 0 #000 , -1px 0 0 #000"] {
    text-shadow: none !important;
    color: hsl(0, 0%, 100%) !important;
}
body[style*="horizon"]
    table[style="border-collapse: collapse ; border: 1px solid #6688aa ; background-color: rgba(40 , 40 , 60 , 1) ; border-radius: 10px"] {
    background: none !important;
    border-radius: 0 !important;
    border-color: hsl(0, 0%, 60%) !important;
}
body[style*="horizon"]
    th[style="border-bottom: 1px solid #94b8b8 ; padding: 5px"] {
    border-color: hsl(0, 0%, 60%);
}
body[style*="horizon"]
    tr[style="width: auto ; background: rgb(35 , 35 , 100) ; background-attachment: fixed ; font-size: 14px"] {
    background: rgb(var(--green) / 40%) !important;
}
body[style*="horizon"]
    tr[style="width: auto ; background: rgb(80 , 80 , 110) ; background-attachment: fixed ; font-size: 14px"] {
    background: hsla(330, 50%, 50%, 0.4) !important;
}
body[style*="horizon"] .ladder table,
.ladder td,
.ladder th {
    border-color: hsl(0, 0%, 60%);
}
body[style*="horizon"] .ladder th {
    background: hsla(0, 0%, 60%, 0.3);
    color: hsl(0, 0%, 100%);
}
body[style*="horizon"] .ladder span {
    color: hsl(0, 0%, 60%);
}
body[style*="horizon"] .folder.cur .selectFolder,
body[style*="horizon"] .folder.cur .selectFolder:hover,
body[style*="horizon"] .folder.cur .selectFolder:active,
body[style*="horizon"] .dark .folder.cur .selectFolder,
body[style*="horizon"] .dark .folder.cur .selectFolder:hover,
body[style*="horizon"] .dark .folder.cur .selectFolder:active {
    background: rgb(var(--green) / 40%);
    color: hsl(0, 0%, 100%);
    border: 2px solid rgb(var(--green) / 40%);
    padding-top: 0px;
    padding-left: 7px;
    height: 35px;
}
body[style*="horizon"] .selectFolder a,
body[style*="horizon"] .dark .selectFolder a,
body[style*="horizon"] .selectFolder a:visited,
body[style*="horizon"] .dark .selectFolder a:visited {
    color: rgb(var(--green));
}
body[style*="horizon"] .setchart-nickname,
body[style*="horizon"] .dark .setchart-nickname {
    background: #277c39;
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
}
body[style*="horizon"] .setchart,
body[style*="horizon"] .dark .setchart {
    border-color: transparent;
    background-color: #277c39;
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
}
body[style*="horizon"] .ps-room .setchart .textbox,
body[style*="horizon"] .dark .setchart .textbox,
body[style*="horizon"] .ps-room .setchart-nickname .textbox,
body[style*="horizon"] .dark .setchart-nickname .textbox {
    background: #00000085;
    box-shadow: inset 0 2px 3px hsla(0, 0%, 0%, 0.1);
}
body[style*="horizon"] .ps-room .setchart .textbox:hover,
body[style*="horizon"] .dark .setchart .textbox:hover,
body[style*="horizon"] .ps-room .setchart-nickname .textbox:hover,
body[style*="horizon"] .dark .setchart-nickname .textbox:hover {
    background: #00000052;
    box-shadow: inset 0 2px 3px hsla(0, 0%, 0%, 0.1);
}
body[style*="horizon"] .ps-room .setchart .textbox:focus,
body[style*="horizon"] .dark .setchart .textbox:focus,
body[style*="horizon"] .ps-room .setchart-nickname .textbox:focus,
body[style*="horizon"] .dark .setchart-nickname .textbox:focus {
    background: #0000004f;
    box-shadow: inset 0 2px 3px hsla(0, 0%, 0%, 0.1);
}
@keyframes shift-solid {
    0% {
        background: #0000004f;
    }
    50% {
        background: #0000009c;
    }
    100% {
        background: #0000004f;
    }
}
body[style*="horizon"] .setchart .textbox:disabled:hover,
body[style*="horizon"] .dark .setchart .textbox:disabled:hover,
body[style*="horizon"] .setchart-nickname .textbox:disabled:hover,
body[style*="horizon"] .dark .setchart-nickname .textbox:disabled:hover {
    background: #6f5b00;
}
body[style*="horizon"] .setcol-icon label,
body[style*="horizon"] .dark .setcol-icon label {
    text-shadow: #277c39 1px 1px 0, #277c39 1px -1px 0, #277c39 -1px 1px 0,
        #277c39 -1px -1px 0;
}
body[style*="horizon"] .setchart input.incomplete {
    color: #277c39;
    border-color: transparent;
}
body[style*="horizon"] .utilichart h3,
body[style*="horizon"] .dexentry h3,
body[style*="horizon"] .resultheader h3,
body[style*="horizon"] .dark .utilichart h3,
body[style*="horizon"] .dark .dexentry h3,
body[style*="horizon"] .dark .resultheader h3 {
    font-family: "Lexend", sans-serif !important;
    color: hsl(0, 0%, 100%);
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
    text-shadow: none;
    background: #277c39;
    border: 2px solid transparent;
    border-radius: 6px;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    inset: 0;
    width: 685px;
    box-sizing: border-box;
}
body[style*="horizon"] .utilichart .sortrow {
    border: none;
    border-radius: 6px;
    background: #277c39;
    height: 100%;
    width: 685px;
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
}
body[style*="horizon"] .utilichart .sortcol.cur,
body[style*="horizon"] .utilichart .sortcol:hover,
body[style*="horizon"] .utilichart .sortcol:focus-visible,
body[style*="horizon"] .utilichart .sortcol.numsortcol.cur,
body[style*="horizon"] .utilichart .sortcol.numsortcol.cur:hover {
    background: rgb(var(--green) / 80%);
    outline: transparent;
    border-radius: 4px;
    height: 25px;
}
body[style*="horizon"] .utilichart .sortcol.cur:focus-visible {
    background: rgb(var(--green) / 67%);
}
body[style*="horizon"] .utilichart b {
    color: rgb(var(--green));
}
body[style*="horizon"] .utilichart .filtercol em {
    color: rgb(var(--green));
    border-color: transparent;
    border-radius: 6px;
    background: rgb(var(--green) / 20%);
}
body[style*="horizon"] .utilichart .filter:hover i,
body[style*="horizon"] .searchboxwrapper .filter:hover i,
body[style*="horizon"] .utilichart .filter:focus-visible i,
body[style*="horizon"] .searchboxwrapper .filter:focus-visible i {
    color: rgb(var(--green));
}
body[style*="horizon"] .teambuilder-clipboard-data,
body[style*="horizon"] .dark .teambuilder-clipboard-data {
    right: auto;
    border: none;
    background: #277c39;
    color: hsl(0, 0%, 100%);
    transition: 0.15s;
    border-radius: 6px;
}
body[style*="horizon"] .teambuilder-clipboard-data:hover {
    background: rgb(var(--green) / 80%);
    border: none;
}
body[style*="horizon"] .teambar button:hover,
body[style*="horizon"] .dark .teambar button:hover,
body[style*="horizon"] .teambar button:focus-visible {
    background: none;
    border: none;
    border-bottom: 2px solid rgb(var(--green) / 40%);
    height: 50px;
    transform: translateY(0px);
}
body[style*="horizon"] .teambar button:disabled,
body[style*="horizon"] .teambar button:disabled:hover,
body[style*="horizon"] .teambar button:disabled:active,
body[style*="horizon"] .dark .teambar button:disabled,
body[style*="horizon"] .dark .teambar button:disabled:hover,
body[style*="horizon"] .dark .teambar button:disabled:active {
    background: none;
    border-color: rgb(var(--green));
    opacity: 1;
    transform: translateY(0px);
}
body[style*="horizon"] .blocklink:hover,
body[style*="horizon"] .dark .blocklink:hover,
body[style*="horizon"] .blocklink:focus-visible {
    background: rgb(var(--green) / 40%);
    color: hsl(0, 0%, 100%);
    border: 2px solid rgb(var(--green) / 40%);
    outline: transparent;
}
body[style*="horizon"] .select:hover,
body[style*="horizon"] .team:hover,
body[style*="horizon"] .dark .select:hover,
body[style*="horizon"] .dark .team:hover,
body[style*="horizon"] .select:active,
body[style*="horizon"] .team:active,
body[style*="horizon"] .dark .select:active,
body[style*="horizon"] .dark .team:active,
body[style*="horizon"] .select:focus-visible,
body[style*="horizon"] .team:focus-visible,
body[style*="horizon"] .dark .select:hover,
body[style*="horizon"] .dark .select:hover .team,
body[style*="horizon"] .dark a.team:hover,
body[style*="horizon"] .dark button.team:hover {
    background: rgb(var(--green) / 60%);
    color: hsl(0, 0%, 100%);
    box-shadow: 0 0 10px rgb(var(--green) / 40%);
}
body[style*="horizon"] .popupmenu strong,
.popupmenu h3 {
    color: rgb(var(--green)) !important;
}
body[style*="horizon"] .popupmenu i {
    color: rgb(var(--green)) !important;
    text-shadow: none !important;
}
body[style*="horizon"] i.subtle {
    color: hsla(0, 0%, 60%, 0.15) !important;
    opacity: 1 !important;
    transition: 0.15s;
}
body[style*="horizon"] i.subtle:hover {
    color: rgb(var(--green) / 40%) !important;
    opacity: 1 !important;
}
body[style*="horizon"] input[type="range"]::-webkit-slider-thumb {
    background: rgb(var(--green));
}
body[style*="horizon"] input[type="range"]:hover::-webkit-slider-thumb {
    background: rgb(var(--green));
    border-color: rgb(var(--green));
}
body[style*="horizon"] input[type="range"]:focus::-webkit-slider-thumb {
    border-color: rgb(var(--green));
}
body[style*="horizon"] input[type="range"]:active::-webkit-slider-thumb {
    border-color: rgb(var(--green));
    box-shadow: 0 0 0 3px rgb(var(--green) / 40%);
}
body[style*="horizon"] button[name="copySet"]:hover::before,
body[style*="horizon"] button[name="importSet"]:hover::before,
body[style*="horizon"] button[name="moveSet"]:hover::before,
body[style*="horizon"] button[name="deleteSet"]:hover::before,
body[style*="horizon"] button[name="edit"]:hover::before,
body[style*="horizon"] button[name="duplicate"]:hover::before,
body[style*="horizon"] button[name="delete"]:hover::before {
    background-color: rgb(var(--green)) !important;
}
body[style*="ocean"] .tabbar a.button.subtle-notifying,
body[style*="ocean"] .dark .tabbar a.button.subtle-notifying,
body[style*="ocean"] .tablist a.button.subtle-notifying {
    color: rgb(var(--blue));
}
body[style*="ocean"] .tabbar a.button.notifying,
body[style*="ocean"] .dark .tabbar a.button.notifying,
body[style*="ocean"] .tablist a.button.notifying {
    background: rgb(var(--blue) / calc(56 / 255 * 100%));
    border-color: rgb(var(--blue) / 40%);
    color: rgb(var(--blue));
}
body[style*="ocean"] .tabbar a.button.notifying:hover,
body[style*="ocean"] .dark .tabbar a.button.notifying:hover,
body[style*="ocean"] .tablist a.button.notifying:hover {
    background: rgb(var(--blue) / calc(77 / 255 * 100%));
    border-color: rgb(var(--blue) / calc(179 / 255 * 100%));
}
body[style*="ocean"] .tabbar a.button,
body[style*="ocean"] .dark .tabbar a.button {
    border-color: #99999926;
    background: #99999926;
    color: #ffffff;
}
body[style*="ocean"] .tabbar a.button:hover,
body[style*="ocean"] .tabbar a.button:active,
body[style*="ocean"] .tabbar a.button:focus-visible,
body[style*="ocean"] .dark .tabbar a.button:hover,
body[style*="ocean"] .dark .tabbar a.button:active {
    background: #9999994d;
    border-color: #9999994d;
}
body[style*="ocean"] .tabbar a.button.cur,
body[style*="ocean"] .tabbar a.button.cur:hover,
body[style*="ocean"] .dark .tabbar a.button.cur,
body[style*="ocean"] .dark .tabbar a.button.cur:hover {
    background: rgb(var(--blue) / 40%);
    color: #ffffff;
    border-color: rgb(var(--blue) / 40%);
}
body[style*="ocean"] .tabbar a.button.cur:focus-visible,
body[style*="ocean"] .tabbar a.button.cur:focus-visible:hover {
    background: rgb(var(--blue));
}
body[style*="ocean"] .maintabbar .overflow .button {
    background: #263f59;
}
body[style*="ocean"] .maintabbar .overflow .button:hover,
body[style*="ocean"] .maintabbar .overflow .button:active,
body[style*="ocean"] .maintabbar .overflow .button:focus-visible {
    background: #1f334d;
}
body[style*="ocean"] .tablist .button.cur,
body[style*="ocean"] .tablist .button.cur:hover {
    background: rgb(var(--blue) / 40%);
    color: #ffffff;
    border-color: rgb(var(--blue) / 40%);
}
body[style*="ocean"] .tablist .button {
    border-color: #99999926;
}
body[style*="ocean"] .tablist .button:hover {
    background: #9999994d;
    border-color: #9999994d;
}
body[style*="ocean"] .button,
body[style*="ocean"] .dark .button {
    background-color: #99999926;
    color: #ffffff;
}
body[style*="ocean"] .button:hover,
body[style*="ocean"] .dark .button:hover,
body[style*="ocean"] .button:active,
body[style*="ocean"] .dark .button:active,
body[style*="ocean"] .button:focus-visible,
body[style*="ocean"] .dark .button:focus-visible {
    background-color: rgb(var(--blue) / 60%);
    box-shadow: 0 0 10px rgb(var(--blue) / 40%);
}
body[style*="ocean"] .button.disabled,
body[style*="ocean"] .dark .button.disabled,
body[style*="ocean"] .button.disabled:hover,
body[style*="ocean"] .dark .button.disabled:hover,
body[style*="ocean"] .button.disabled:active,
body[style*="ocean"] .dark .button.disabled:active,
body[style*="ocean"] .button:disabled,
body[style*="ocean"] .dark .button:disabled,
body[style*="ocean"] .button:disabled:hover,
body[style*="ocean"] .dark .button:disabled:hover,
body[style*="ocean"] .button:disabled:active,
body[style*="ocean"] .dark .button:disabled:active {
    background: #99999926;
    color: #ffffff;
}
body[style*="ocean"] .checkbox:hover,
body[style*="ocean"] .menugroup .checkbox:hover,
body[style*="ocean"] .dark .checkbox:hover {
    background-color: #99999926;
}
body[style*="ocean"] .checkbox:has(input:focus-visible) {
    background-color: #99999926;
}
body[style*="ocean"] input[type="checkbox"]:hover {
    background-color: rgb(var(--blue) / calc(117 / 255 * 100%)) !important;
    border-color: rgb(var(--blue)) !important;
}
body[style*="ocean"] input[type="checkbox"]:checked {
    background-color: rgb(var(--blue)) !important;
    border-color: rgb(var(--blue)) !important;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3.5 8l2.5 2.5 6-6' fill='none' stroke='%2300000080' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") !important;
}
body[style*="ocean"] input[type="checkbox"]:checked:hover {
    background-color: rgb(var(--blue)) !important;
    border-color: rgb(var(--blue)) !important;
}
body[style*="ocean"] input[type="checkbox"]:focus-visible {
    box-shadow: 0 0 0 3px rgb(var(--blue) / calc(38 / 255 * 100%)) !important;
}
body[style*="ocean"] .closebutton:hover,
body[style*="ocean"] .dark .closebutton:hover,
body[style*="ocean"] .closebutton:active,
body[style*="ocean"] .closebutton:focus-visible {
    color: rgb(var(--blue));
}
body[style*="ocean"] .ps-popup .userdetails .rooms span {
    display: inline-block !important;
    max-width: 55% !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    vertical-align: middle !important;
}
body[style*="ocean"] a,
body[style*="ocean"] .dark a,
body[style*="ocean"] a.ilink,
body[style*="ocean"] .dark a.ilink {
    color: rgb(var(--blue));
    outline: 2px solid transparent;
}
body[style*="ocean"] a:not(.button, body[style*="ocean"] .blocklink):visited,
body[style*="ocean"]
    .dark
    a:not(.button, body[style*="ocean"] .blocklink):visited,
body[style*="ocean"] a.ilink.yours,
body[style*="ocean"] a.ilink:hover {
    color: rgb(var(--blue));
}
body[style*="ocean"] a:focus-visible {
    outline: 2px solid currentColor;
    border-radius: 2px;
    transition: outline 0.15s;
}
body[style*="ocean"] a.subtle,
body[style*="ocean"] button.subtle,
body[style*="ocean"] .dark button.subtle {
    color: hsl(0, 0%, 100%);
    background: none;
    transition: 0.15s;
}
body[style*="ocean"] a.subtle:hover,
body[style*="ocean"] button.subtle:hover,
body[style*="ocean"] a.subtle:focus-visible,
body[style*="ocean"] button.subtle:focus-visible {
    color: rgb(var(--blue));
    text-decoration: none;
    outline: transparent;
}
body[style*="ocean"] .option,
body[style*="ocean"] .dark .option {
    color: hsl(0, 0%, 100%);
    border-radius: 6px;
}
body[style*="ocean"] .option:hover,
body[style*="ocean"] .dark .option:hover,
body[style*="ocean"] .option:focus-visible {
    background-color: hsla(0, 0%, 60%, 0.15);
    border-color: rgb(var(--blue) / 40%);
}
body[style*="ocean"] .option.cur,
body[style*="ocean"] .dark .option.cur {
    background-color: hsla(0, 0%, 60%, 0.15);
    border-color: rgb(var(--blue) / 40%);
}
body[style*="ocean"] .option.cur:hover,
body[style*="ocean"] .dark .option.cur:hover,
body[style*="ocean"] .option.cur:focus-visible {
    background-color: hsla(0, 0%, 60%, 0.3);
    border-color: rgb(var(--blue) / 60%);
}
body[style*="ocean"] .popupmenu .option {
    border: none;
    color: hsl(0, 0%, 100%);
    border-radius: 0 6px 6px 0;
    border-left: 2px solid transparent;
    display: flex;
    align-items: center;
    margin-top: 2px;
}
body[style*="ocean"] .popupmenu .option:not([name="moveHere"]) {
    justify-content: space-between;
}
body[style*="ocean"] .popupmenu .option:hover,
body[style*="ocean"] .popupmenu .option.cur {
    border-color: rgb(var(--blue) / 40%);
}
body[style*="ocean"] .avatarlist .option {
    border: none;
}
body[style*="ocean"] .formlist .option {
    border: none;
}
body[style*="ocean"] .bglist .option {
    text-align: center;
    border: none;
    padding: 4px;
}
body[style*="ocean"] .bglist button span,
body[style*="ocean"] .bglist .option strong {
    border-radius: inherit;
}
body[style*="ocean"]
    .bglist
    .option
    strong[style="background:#888888;color:white;padding:16px 18px;display:block;font-size:12pt"] {
    background: rgb(var(--blue) / 40%) !important;
}
body[style*="ocean"]
    .ps-popup[style*="max-width: 448px; position: absolute; margin: 0px;"] {
    max-width: 455px !important;
}
body[style*="ocean"]
    .bgstatus
    strong[style="background:blue;color:white;padding:1px 4px;border-radius:4px;display:block"] {
    background: hsl(330, 50%, 50%) !important;
    border-radius: 6px !important;
}
body[style*="ocean"] .menugroup {
    background: radial-gradient(
        hsla(210, 20%, 10%, 0.6),
        hsla(210, 20%, 10%, 0.7)
    );
    backdrop-filter: blur(35px) saturate(180%);
    border: 1px solid hsla(0, 0%, 60%, 0.15);
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
    border-radius: 6px;
    text-shadow: none;
    color: hsl(0, 0%, 100%);
}
@media (max-width: 895px) {
    body[style*="ocean"] .rightmenu {
        padding-bottom: 0;
    }
}
body[style*="ocean"] .tiny-layout .rightmenu,
body[style*="ocean"] .mainmenu {
    padding-bottom: 0;
}
body[style*="ocean"] .leftmenu,
body[style*="ocean"] .tiny-layout .leftmenu {
    padding-top: 6px;
}
body[style*="ocean"] .menugroup {
    margin: 0 6px 6px 6px;
}
body[style*="ocean"] .tiny-layout .menugroup {
    margin: 0 auto 6px;
}
body[style*="ocean"] .activitymenu {
    left: 284px;
    top: 6px;
}
body[style*="ocean"] .pm-window {
    margin: 0 -24px 6px 0;
}
body[style*="ocean"] .tiny-layout .pm-window {
    margin: 0 -1px 6px -1px;
}
body[style*="ocean"] .tiny-layout .activitymenu {
    padding-bottom: 0;
}
body[style*="ocean"] .rightmenu {
    top: 6px;
}
body[style*="ocean"] .rightmenu {
    top: 6px;
    width: 270px;
    right: 6px;
}
body[style*="ocean"] .rightmenu > .menugroup {
    margin: 0px;
}
body[style*="ocean"] .pm-window,
body[style*="ocean"] .dark .pm-window {
    border-radius: 6px;
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
    background: radial-gradient(
        hsla(210, 20%, 10%, 0.6),
        hsla(210, 20%, 10%, 0.7)
    );
    backdrop-filter: blur(35px) saturate(180%);
}
body[style*="ocean"] .pm-window h3,
body[style*="ocean"] .dark .pm-window h3 {
    background: none;
    color: hsl(0, 0%, 60%);
    border: 1px solid hsla(0, 0%, 60%, 0.15);
    border-radius: 6px 6px 0 0;
}
body[style*="ocean"] .pm-window h3 small {
    color: hsl(0, 0%, 60%);
}
body[style*="ocean"] .pm-window h3.pm-minimized {
    border-radius: 6px;
}
body[style*="ocean"] .pm-window h3,
body[style*="ocean"] .minimizebutton,
body[style*="ocean"] .closebutton {
    transition: color 0.15s;
}
body[style*="ocean"] .minimizebutton:hover,
body[style*="ocean"] .closebutton:hover,
body[style*="ocean"] .minimizebutton:focus-visible,
body[style*="ocean"] .closebutton:focus-visible {
    background: none;
}
body[style*="ocean"] .pm-window h3:hover,
body[style*="ocean"] .dark .pm-window h3:hover {
    color: hsl(0, 0%, 100%);
}
body[style*="ocean"] .pm-window h3.pm-notifying,
body[style*="ocean"] .dark .pm-window h3.pm-notifying {
    border-color: hsla(0, 0%, 60%, 0.15);
    background: none;
    box-shadow: inset 0 0 0 500px rgb(var(--blue) / 40%);
}
body[style*="ocean"] .pm-window h3.pm-notifying:hover,
body[style*="ocean"] .dark .pm-window h3.pm-notifying:hover {
    border-color: hsla(0, 0%, 60%, 0.15);
    background: none;
}
body[style*="ocean"] .header-username,
body[style*="ocean"] .closebutton,
body[style*="ocean"] .minimizebutton,
body[style*="ocean"] .dark .closebutton,
body[style*="ocean"] .dark .minimizebutton {
    color: hsl(0, 0%, 60%);
}
body[style*="ocean"] .minimizebutton:hover,
body[style*="ocean"] .pm-window h3:hover .minimizebutton,
body[style*="ocean"] .dark .minimizebutton:hover,
body[style*="ocean"] .dark .pm-window h3:hover .minimizebutton {
    color: hsl(0, 0%, 100%);
}
body[style*="ocean"] .pm-window h3 .closebutton:hover + .minimizebutton {
    color: hsl(0, 0%, 60%) !important;
}
body[style*="ocean"] .closebutton:hover,
body[style*="ocean"] .dark .closebutton:hover,
body[style*="ocean"] .closebutton:active,
body[style*="ocean"] .closebutton:focus-visible {
    color: rgb(var(--blue));
    outline: transparent;
}
body[style*="ocean"] .minimizebutton:active {
    color: hsl(0, 0%, 100%);
}
body[style*="ocean"] .pm-window.focused h3,
body[style*="ocean"] .pm-window.focused h3:hover,
body[style*="ocean"] .dark .pm-window.focused h3,
body[style*="ocean"] .dark .pm-window.focused h3:hover {
    background: none;
    color: hsl(0, 0%, 100%);
}
body[style*="ocean"] .pm-window.focused h3,
body[style*="ocean"] .pm-window.focused .pm-log,
body[style*="ocean"] .pm-window.focused .pm-log-add,
body[style*="ocean"] .dark .pm-window.focused h3,
body[style*="ocean"] .dark .pm-window.focused .pm-log,
body[style*="ocean"] .dark .pm-window.focused .pm-log-add {
    border-color: hsla(0, 0%, 60%, 0.15);
}
body[style*="ocean"] .pm-log,
body[style*="ocean"] .dark .pm-log {
    color: hsl(0, 0%, 100%);
    background: none;
    border-color: hsla(0, 0%, 60%, 0.15);
    backdrop-filter: none;
}
body[style*="ocean"] .news-embed .pm-log {
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
}
body[style*="ocean"] .newsentry,
body[style*="ocean"] .dark .newsentry {
    border-bottom: 1px solid hsla(0, 0%, 60%, 0.15);
}
body[style*="ocean"] .newsentry:last-child {
    border-radius: inherit;
}
body[style*="ocean"] .unread {
    background: none;
    box-shadow: inset 0 0 0 500px rgb(var(--blue) / 40%);
}
body[style*="ocean"] .pm-log-add,
body[style*="ocean"] .dark .pm-log-add {
    background: none;
    border-color: hsla(0, 0%, 60%, 0.15);
    padding: 4px 4px 4px 0px;
}
body[style*="ocean"] .pm-buttonbar button,
body[style*="ocean"] .dark .pm-buttonbar button {
    background: none;
    border: none;
    color: hsl(0, 0%, 60%);
    transition: 0.15s;
}
body[style*="ocean"] .pm-buttonbar button:hover,
body[style*="ocean"] .dark .pm-buttonbar button:hover {
    background: none;
    color: hsl(0, 0%, 100%);
}
body[style*="ocean"] .challenge {
    background: none;
    border-color: hsla(0, 0%, 60%, 0.15);
    border-top: none;
    color: hsl(0, 0%, 100%);
    margin-top: 0;
}
body[style*="ocean"] .pm-minimized + .challenge {
    display: none;
}
body[style*="ocean"]
    div[style="max-height: 222px ; overflow-y: auto ; color: #fff ; text-shadow: 1px 0 0 #000 , 0 -1px 0 #000 , 0 1px 0 #000 , -1px 0 0 #000"] {
    text-shadow: none !important;
    color: hsl(0, 0%, 100%) !important;
}
body[style*="ocean"]
    table[style="border-collapse: collapse ; border: 1px solid #6688aa ; background-color: rgba(40 , 40 , 60 , 1) ; border-radius: 10px"] {
    background: none !important;
    border-radius: 0 !important;
    border-color: hsl(0, 0%, 60%) !important;
}
body[style*="ocean"]
    th[style="border-bottom: 1px solid #94b8b8 ; padding: 5px"] {
    border-color: hsl(0, 0%, 60%);
}
body[style*="ocean"]
    tr[style="width: auto ; background: rgb(35 , 35 , 100) ; background-attachment: fixed ; font-size: 14px"] {
    background: rgb(var(--blue) / 40%) !important;
}
body[style*="ocean"]
    tr[style="width: auto ; background: rgb(80 , 80 , 110) ; background-attachment: fixed ; font-size: 14px"] {
    background: hsla(330, 50%, 50%, 0.4) !important;
}
body[style*="ocean"] .ladder table,
.ladder td,
.ladder th {
    border-color: hsl(0, 0%, 60%);
}
body[style*="ocean"] .ladder th {
    background: hsla(0, 0%, 60%, 0.3);
    color: hsl(0, 0%, 100%);
}
body[style*="ocean"] .ladder span {
    color: hsl(0, 0%, 60%);
}
body[style*="ocean"] .folder.cur .selectFolder,
body[style*="ocean"] .folder.cur .selectFolder:hover,
body[style*="ocean"] .folder.cur .selectFolder:active,
body[style*="ocean"] .dark .folder.cur .selectFolder,
body[style*="ocean"] .dark .folder.cur .selectFolder:hover,
body[style*="ocean"] .dark .folder.cur .selectFolder:active {
    background: rgb(var(--blue) / 40%);
    color: hsl(0, 0%, 100%);
    border: 2px solid rgb(var(--blue) / 40%);
    padding-top: 0px;
    padding-left: 7px;
    height: 35px;
}
body[style*="ocean"] .selectFolder a,
body[style*="ocean"] .dark .selectFolder a,
body[style*="ocean"] .selectFolder a:visited,
body[style*="ocean"] .dark .selectFolder a:visited {
    color: rgb(var(--blue));
}
body[style*="ocean"] .setchart-nickname,
body[style*="ocean"] .dark .setchart-nickname {
    background: #3f7894;
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
}
body[style*="ocean"] .setchart,
body[style*="ocean"] .dark .setchart {
    border-color: transparent;
    background-color: #3f7894;
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
}
body[style*="ocean"] .ps-room .setchart .textbox,
body[style*="ocean"] .dark .setchart .textbox,
body[style*="ocean"] .ps-room .setchart-nickname .textbox,
body[style*="ocean"] .dark .setchart-nickname .textbox {
    background: #00000085;
    box-shadow: inset 0 2px 3px hsla(0, 0%, 0%, 0.1);
}
body[style*="ocean"] .ps-room .setchart .textbox:hover,
body[style*="ocean"] .dark .setchart .textbox:hover,
body[style*="ocean"] .ps-room .setchart-nickname .textbox:hover,
body[style*="ocean"] .dark .setchart-nickname .textbox:hover {
    background: #00000052;
    box-shadow: inset 0 2px 3px hsla(0, 0%, 0%, 0.1);
}
body[style*="ocean"] .ps-room .setchart .textbox:focus,
body[style*="ocean"] .dark .setchart .textbox:focus,
body[style*="ocean"] .ps-room .setchart-nickname .textbox:focus,
body[style*="ocean"] .dark .setchart-nickname .textbox:focus {
    background: #0000004f;
    box-shadow: inset 0 2px 3px hsla(0, 0%, 0%, 0.1);
}
@keyframes shift-solid {
    0% {
        background: #0000004f;
    }
    50% {
        background: #0000009c;
    }
    100% {
        background: #0000004f;
    }
}
body[style*="ocean"] .setchart .textbox:disabled:hover,
body[style*="ocean"] .dark .setchart .textbox:disabled:hover,
body[style*="ocean"] .setchart-nickname .textbox:disabled:hover,
body[style*="ocean"] .dark .setchart-nickname .textbox:disabled:hover {
    background: #6f5b00;
}
body[style*="ocean"] .setcol-icon label,
body[style*="ocean"] .dark .setcol-icon label {
    text-shadow: #3f7894 1px 1px 0, #3f7894 1px -1px 0, #3f7894 -1px 1px 0,
        #3f7894 -1px -1px 0;
}
body[style*="ocean"] .setchart input.incomplete {
    color: #3f7894;
    border-color: transparent;
}
body[style*="ocean"] .utilichart h3,
body[style*="ocean"] .dexentry h3,
body[style*="ocean"] .resultheader h3,
body[style*="ocean"] .dark .utilichart h3,
body[style*="ocean"] .dark .dexentry h3,
body[style*="ocean"] .dark .resultheader h3 {
    font-family: "Lexend", sans-serif !important;
    color: hsl(0, 0%, 100%);
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
    text-shadow: none;
    background: #3f7894;
    border: 2px solid transparent;
    border-radius: 6px;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    inset: 0;
    width: 685px;
    box-sizing: border-box;
}
body[style*="ocean"] .utilichart .sortrow {
    border: none;
    border-radius: 6px;
    background: #3f7894;
    height: 100%;
    width: 685px;
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
}
body[style*="ocean"] .utilichart .sortcol.cur,
body[style*="ocean"] .utilichart .sortcol:hover,
body[style*="ocean"] .utilichart .sortcol:focus-visible,
body[style*="ocean"] .utilichart .sortcol.numsortcol.cur,
body[style*="ocean"] .utilichart .sortcol.numsortcol.cur:hover {
    background: rgb(var(--blue) / 80%);
    outline: transparent;
    border-radius: 4px;
    height: 25px;
}
body[style*="ocean"] .utilichart .sortcol.cur:focus-visible {
    background: rgb(var(--blue) / 67%);
}
body[style*="ocean"] .utilichart b {
    color: rgb(var(--blue));
}
body[style*="ocean"] .utilichart .filtercol em {
    color: rgb(var(--blue));
    border-color: transparent;
    border-radius: 6px;
    background: rgb(var(--blue) / 20%);
}
body[style*="ocean"] .utilichart .filter:hover i,
body[style*="ocean"] .searchboxwrapper .filter:hover i,
body[style*="ocean"] .utilichart .filter:focus-visible i,
body[style*="ocean"] .searchboxwrapper .filter:focus-visible i {
    color: rgb(var(--blue));
}
body[style*="ocean"] .teambuilder-clipboard-data,
body[style*="ocean"] .dark .teambuilder-clipboard-data {
    right: auto;
    border: none;
    background: #3f7894;
    color: hsl(0, 0%, 100%);
    transition: 0.15s;
    border-radius: 6px;
}
body[style*="ocean"] .teambuilder-clipboard-data:hover {
    background: rgb(var(--blue) / 80%);
    border: none;
}
body[style*="ocean"] .teambar button:hover,
body[style*="ocean"] .dark .teambar button:hover,
body[style*="ocean"] .teambar button:focus-visible {
    background: none;
    border: none;
    border-bottom: 2px solid rgb(var(--blue) / 40%);
    height: 50px;
    transform: translateY(0px);
}
body[style*="ocean"] .teambar button:disabled,
body[style*="ocean"] .teambar button:disabled:hover,
body[style*="ocean"] .teambar button:disabled:active,
body[style*="ocean"] .dark .teambar button:disabled,
body[style*="ocean"] .dark .teambar button:disabled:hover,
body[style*="ocean"] .dark .teambar button:disabled:active {
    background: none;
    border-color: rgb(var(--blue));
    opacity: 1;
    transform: translateY(0px);
}
body[style*="ocean"] .blocklink:hover,
body[style*="ocean"] .dark .blocklink:hover,
body[style*="ocean"] .blocklink:focus-visible {
    background: rgb(var(--blue) / 40%);
    color: hsl(0, 0%, 100%);
    border: 2px solid rgb(var(--blue) / 40%);
    outline: transparent;
}
body[style*="ocean"] .select:hover,
body[style*="ocean"] .team:hover,
body[style*="ocean"] .dark .select:hover,
body[style*="ocean"] .dark .team:hover,
body[style*="ocean"] .select:active,
body[style*="ocean"] .team:active,
body[style*="ocean"] .dark .select:active,
body[style*="ocean"] .dark .team:active,
body[style*="ocean"] .select:focus-visible,
body[style*="ocean"] .team:focus-visible,
body[style*="ocean"] .dark .select:hover,
body[style*="ocean"] .dark .select:hover .team,
body[style*="ocean"] .dark a.team:hover,
body[style*="ocean"] .dark button.team:hover {
    background: rgb(var(--blue) / 60%);
    color: hsl(0, 0%, 100%);
    box-shadow: 0 0 10px rgb(var(--blue) / 40%);
}
body[style*="ocean"] .popupmenu strong,
.popupmenu h3 {
    color: rgb(var(--blue)) !important;
}
body[style*="ocean"] .popupmenu i {
    color: rgb(var(--blue)) !important;
    text-shadow: none !important;
}
body[style*="ocean"] i.subtle {
    color: hsla(0, 0%, 60%, 0.15) !important;
    opacity: 1 !important;
    transition: 0.15s;
}
body[style*="ocean"] i.subtle:hover {
    color: rgb(var(--blue) / 40%) !important;
    opacity: 1 !important;
}
body[style*="ocean"] input[type="range"]::-webkit-slider-thumb {
    background: rgb(var(--blue));
}
body[style*="ocean"] input[type="range"]:hover::-webkit-slider-thumb {
    background: rgb(var(--blue));
    border-color: rgb(var(--blue));
}
body[style*="ocean"] input[type="range"]:focus::-webkit-slider-thumb {
    border-color: rgb(var(--blue));
}
body[style*="ocean"] input[type="range"]:active::-webkit-slider-thumb {
    border-color: rgb(var(--blue));
    box-shadow: 0 0 0 3px rgb(var(--blue) / 40%);
}
body[style*="ocean"] button[name="copySet"]:hover::before,
body[style*="ocean"] button[name="importSet"]:hover::before,
body[style*="ocean"] button[name="moveSet"]:hover::before,
body[style*="ocean"] button[name="deleteSet"]:hover::before,
body[style*="ocean"] button[name="edit"]:hover::before,
body[style*="ocean"] button[name="duplicate"]:hover::before,
body[style*="ocean"] button[name="delete"]:hover::before {
    background-color: rgb(var(--blue)) !important;
}
body[style*="shaymin"] .tabbar a.button.subtle-notifying,
body[style*="shaymin"] .dark .tabbar a.button.subtle-notifying,
body[style*="shaymin"] .tablist a.button.subtle-notifying {
    color: rgb(var(--yellow));
}
body[style*="shaymin"] .tabbar a.button.notifying,
body[style*="shaymin"] .dark .tabbar a.button.notifying,
body[style*="shaymin"] .tablist a.button.notifying {
    background: rgb(var(--yellow) / calc(56 / 255 * 100%));
    border-color: rgb(var(--yellow) / 40%);
    color: rgb(var(--yellow));
}
body[style*="shaymin"] .tabbar a.button.notifying:hover,
body[style*="shaymin"] .dark .tabbar a.button.notifying:hover,
body[style*="shaymin"] .tablist a.button.notifying:hover {
    background: rgb(var(--yellow) / calc(77 / 255 * 100%));
    border-color: rgb(var(--yellow) / calc(179 / 255 * 100%));
}
body[style*="shaymin"] .tabbar a.button,
body[style*="shaymin"] .dark .tabbar a.button {
    border-color: #99999926;
    background: #99999926;
    color: #ffffff;
}
body[style*="shaymin"] .tabbar a.button:hover,
body[style*="shaymin"] .tabbar a.button:active,
body[style*="shaymin"] .tabbar a.button:focus-visible,
body[style*="shaymin"] .dark .tabbar a.button:hover,
body[style*="shaymin"] .dark .tabbar a.button:active {
    background: #9999994d;
    border-color: #9999994d;
}
body[style*="shaymin"] .tabbar a.button.cur,
body[style*="shaymin"] .tabbar a.button.cur:hover,
body[style*="shaymin"] .dark .tabbar a.button.cur,
body[style*="shaymin"] .dark .tabbar a.button.cur:hover {
    background: rgb(var(--yellow) / 40%);
    color: #ffffff;
    border-color: rgb(var(--yellow) / 40%);
}
body[style*="shaymin"] .tabbar a.button.cur:focus-visible,
body[style*="shaymin"] .tabbar a.button.cur:focus-visible:hover {
    background: rgb(var(--yellow));
}
body[style*="shaymin"] .maintabbar .overflow .button {
    background: #263f59;
}
body[style*="shaymin"] .maintabbar .overflow .button:hover,
body[style*="shaymin"] .maintabbar .overflow .button:active,
body[style*="shaymin"] .maintabbar .overflow .button:focus-visible {
    background: #1f334d;
}
body[style*="shaymin"] .tablist .button.cur,
body[style*="shaymin"] .tablist .button.cur:hover {
    background: rgb(var(--yellow) / 40%);
    color: #ffffff;
    border-color: rgb(var(--yellow) / 40%);
}
body[style*="shaymin"] .tablist .button {
    border-color: #99999926;
}
body[style*="shaymin"] .tablist .button:hover {
    background: #9999994d;
    border-color: #9999994d;
}
body[style*="shaymin"] .button,
body[style*="shaymin"] .dark .button {
    background-color: #99999926;
    color: #ffffff;
}
body[style*="shaymin"] .button:hover,
body[style*="shaymin"] .dark .button:hover,
body[style*="shaymin"] .button:active,
body[style*="shaymin"] .dark .button:active,
body[style*="shaymin"] .button:focus-visible,
body[style*="shaymin"] .dark .button:focus-visible {
    background-color: rgb(var(--yellow) / 60%);
    box-shadow: 0 0 10px rgb(var(--yellow) / 40%);
}
body[style*="shaymin"] .button.disabled,
body[style*="shaymin"] .dark .button.disabled,
body[style*="shaymin"] .button.disabled:hover,
body[style*="shaymin"] .dark .button.disabled:hover,
body[style*="shaymin"] .button.disabled:active,
body[style*="shaymin"] .dark .button.disabled:active,
body[style*="shaymin"] .button:disabled,
body[style*="shaymin"] .dark .button:disabled,
body[style*="shaymin"] .button:disabled:hover,
body[style*="shaymin"] .dark .button:disabled:hover,
body[style*="shaymin"] .button:disabled:active,
body[style*="shaymin"] .dark .button:disabled:active {
    background: #99999926;
    color: #ffffff;
}
body[style*="shaymin"] .checkbox:hover,
body[style*="shaymin"] .menugroup .checkbox:hover,
body[style*="shaymin"] .dark .checkbox:hover {
    background-color: #99999926;
}
body[style*="shaymin"] .checkbox:has(input:focus-visible) {
    background-color: #99999926;
}
body[style*="shaymin"] input[type="checkbox"]:hover {
    background-color: rgb(var(--yellow) / calc(117 / 255 * 100%)) !important;
    border-color: rgb(var(--yellow)) !important;
}
body[style*="shaymin"] input[type="checkbox"]:checked {
    background-color: rgb(var(--yellow)) !important;
    border-color: rgb(var(--yellow)) !important;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3.5 8l2.5 2.5 6-6' fill='none' stroke='%2300000080' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") !important;
}
body[style*="shaymin"] input[type="checkbox"]:checked:hover {
    background-color: rgb(var(--yellow)) !important;
    border-color: rgb(var(--yellow)) !important;
}
body[style*="shaymin"] input[type="checkbox"]:focus-visible {
    box-shadow: 0 0 0 3px rgb(var(--yellow) / calc(38 / 255 * 100%)) !important;
}
body[style*="shaymin"] .closebutton:hover,
body[style*="shaymin"] .dark .closebutton:hover,
body[style*="shaymin"] .closebutton:active,
body[style*="shaymin"] .closebutton:focus-visible {
    color: rgb(var(--yellow));
}
body[style*="shaymin"] .ps-popup .userdetails .rooms span {
    display: inline-block !important;
    max-width: 55% !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    vertical-align: middle !important;
}
body[style*="shaymin"] a,
body[style*="shaymin"] .dark a,
body[style*="shaymin"] a.ilink,
body[style*="shaymin"] .dark a.ilink {
    color: rgb(var(--yellow));
    outline: 2px solid transparent;
}
body[style*="shaymin"]
    a:not(.button, body[style*="shaymin"] .blocklink):visited,
body[style*="shaymin"]
    .dark
    a:not(.button, body[style*="shaymin"] .blocklink):visited,
body[style*="shaymin"] a.ilink.yours,
body[style*="shaymin"] a.ilink:hover {
    color: rgb(var(--yellow));
}
body[style*="shaymin"] a:focus-visible {
    outline: 2px solid currentColor;
    border-radius: 2px;
    transition: outline 0.15s;
}
body[style*="shaymin"] a.subtle,
body[style*="shaymin"] button.subtle,
body[style*="shaymin"] .dark button.subtle {
    color: hsl(0, 0%, 100%);
    background: none;
    transition: 0.15s;
}
body[style*="shaymin"] a.subtle:hover,
body[style*="shaymin"] button.subtle:hover,
body[style*="shaymin"] a.subtle:focus-visible,
body[style*="shaymin"] button.subtle:focus-visible {
    color: rgb(var(--yellow));
    text-decoration: none;
    outline: transparent;
}
body[style*="shaymin"] .option,
body[style*="shaymin"] .dark .option {
    color: hsl(0, 0%, 100%);
    border-radius: 6px;
}
body[style*="shaymin"] .option:hover,
body[style*="shaymin"] .dark .option:hover,
body[style*="shaymin"] .option:focus-visible {
    background-color: hsla(0, 0%, 60%, 0.15);
    border-color: rgb(var(--yellow) / 40%);
}
body[style*="shaymin"] .option.cur,
body[style*="shaymin"] .dark .option.cur {
    background-color: hsla(0, 0%, 60%, 0.15);
    border-color: rgb(var(--yellow) / 40%);
}
body[style*="shaymin"] .option.cur:hover,
body[style*="shaymin"] .dark .option.cur:hover,
body[style*="shaymin"] .option.cur:focus-visible {
    background-color: hsla(0, 0%, 60%, 0.3);
    border-color: rgb(var(--yellow) / 60%);
}
body[style*="shaymin"] .popupmenu .option {
    border: none;
    color: hsl(0, 0%, 100%);
    border-radius: 0 6px 6px 0;
    border-left: 2px solid transparent;
    display: flex;
    align-items: center;
    margin-top: 2px;
}
body[style*="shaymin"] .popupmenu .option:not([name="moveHere"]) {
    justify-content: space-between;
}
body[style*="shaymin"] .popupmenu .option:hover,
body[style*="shaymin"] .popupmenu .option.cur {
    border-color: rgb(var(--yellow) / 40%);
}
body[style*="shaymin"] .avatarlist .option {
    border: none;
}
body[style*="shaymin"] .formlist .option {
    border: none;
}
body[style*="shaymin"] .bglist .option {
    text-align: center;
    border: none;
    padding: 4px;
}
body[style*="shaymin"] .bglist button span,
body[style*="shaymin"] .bglist .option strong {
    border-radius: inherit;
}
body[style*="shaymin"]
    .bglist
    .option
    strong[style="background:#888888;color:white;padding:16px 18px;display:block;font-size:12pt"] {
    background: rgb(var(--yellow) / 40%) !important;
}
body[style*="shaymin"]
    .ps-popup[style*="max-width: 448px; position: absolute; margin: 0px;"] {
    max-width: 455px !important;
}
body[style*="shaymin"]
    .bgstatus
    strong[style="background:yellow;color:white;padding:1px 4px;border-radius:4px;display:block"] {
    background: hsl(330, 50%, 50%) !important;
    border-radius: 6px !important;
}
body[style*="shaymin"] .menugroup {
    background: radial-gradient(
        hsla(210, 20%, 10%, 0.6),
        hsla(210, 20%, 10%, 0.7)
    );
    backdrop-filter: blur(35px) saturate(180%);
    border: 1px solid hsla(0, 0%, 60%, 0.15);
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
    border-radius: 6px;
    text-shadow: none;
    color: hsl(0, 0%, 100%);
}
@media (max-width: 895px) {
    body[style*="shaymin"] .rightmenu {
        padding-bottom: 0;
    }
}
body[style*="shaymin"] .tiny-layout .rightmenu,
body[style*="shaymin"] .mainmenu {
    padding-bottom: 0;
}
body[style*="shaymin"] .leftmenu,
body[style*="shaymin"] .tiny-layout .leftmenu {
    padding-top: 6px;
}
body[style*="shaymin"] .menugroup {
    margin: 0 6px 6px 6px;
}
body[style*="shaymin"] .tiny-layout .menugroup {
    margin: 0 auto 6px;
}
body[style*="shaymin"] .activitymenu {
    left: 284px;
    top: 6px;
}
body[style*="shaymin"] .pm-window {
    margin: 0 -24px 6px 0;
}
body[style*="shaymin"] .tiny-layout .pm-window {
    margin: 0 -1px 6px -1px;
}
body[style*="shaymin"] .tiny-layout .activitymenu {
    padding-bottom: 0;
}
body[style*="shaymin"] .rightmenu {
    top: 6px;
}
body[style*="shaymin"] .rightmenu {
    top: 6px;
    width: 270px;
    right: 6px;
}
body[style*="shaymin"] .rightmenu > .menugroup {
    margin: 0px;
}
body[style*="shaymin"] .pm-window,
body[style*="shaymin"] .dark .pm-window {
    border-radius: 6px;
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
    background: radial-gradient(
        hsla(210, 20%, 10%, 0.6),
        hsla(210, 20%, 10%, 0.7)
    );
    backdrop-filter: blur(35px) saturate(180%);
}
body[style*="shaymin"] .pm-window h3,
body[style*="shaymin"] .dark .pm-window h3 {
    background: none;
    color: hsl(0, 0%, 60%);
    border: 1px solid hsla(0, 0%, 60%, 0.15);
    border-radius: 6px 6px 0 0;
}
body[style*="shaymin"] .pm-window h3 small {
    color: hsl(0, 0%, 60%);
}
body[style*="shaymin"] .pm-window h3.pm-minimized {
    border-radius: 6px;
}
body[style*="shaymin"] .pm-window h3,
body[style*="shaymin"] .minimizebutton,
body[style*="shaymin"] .closebutton {
    transition: color 0.15s;
}
body[style*="shaymin"] .minimizebutton:hover,
body[style*="shaymin"] .closebutton:hover,
body[style*="shaymin"] .minimizebutton:focus-visible,
body[style*="shaymin"] .closebutton:focus-visible {
    background: none;
}
body[style*="shaymin"] .pm-window h3:hover,
body[style*="shaymin"] .dark .pm-window h3:hover {
    color: hsl(0, 0%, 100%);
}
body[style*="shaymin"] .pm-window h3.pm-notifying,
body[style*="shaymin"] .dark .pm-window h3.pm-notifying {
    border-color: hsla(0, 0%, 60%, 0.15);
    background: none;
    box-shadow: inset 0 0 0 500px rgb(var(--yellow) / 40%);
}
body[style*="shaymin"] .pm-window h3.pm-notifying:hover,
body[style*="shaymin"] .dark .pm-window h3.pm-notifying:hover {
    border-color: hsla(0, 0%, 60%, 0.15);
    background: none;
}
body[style*="shaymin"] .header-username,
body[style*="shaymin"] .closebutton,
body[style*="shaymin"] .minimizebutton,
body[style*="shaymin"] .dark .closebutton,
body[style*="shaymin"] .dark .minimizebutton {
    color: hsl(0, 0%, 60%);
}
body[style*="shaymin"] .minimizebutton:hover,
body[style*="shaymin"] .pm-window h3:hover .minimizebutton,
body[style*="shaymin"] .dark .minimizebutton:hover,
body[style*="shaymin"] .dark .pm-window h3:hover .minimizebutton {
    color: hsl(0, 0%, 100%);
}
body[style*="shaymin"] .pm-window h3 .closebutton:hover + .minimizebutton {
    color: hsl(0, 0%, 60%) !important;
}
body[style*="shaymin"] .closebutton:hover,
body[style*="shaymin"] .dark .closebutton:hover,
body[style*="shaymin"] .closebutton:active,
body[style*="shaymin"] .closebutton:focus-visible {
    color: rgb(var(--yellow));
    outline: transparent;
}
body[style*="shaymin"] .minimizebutton:active {
    color: hsl(0, 0%, 100%);
}
body[style*="shaymin"] .pm-window.focused h3,
body[style*="shaymin"] .pm-window.focused h3:hover,
body[style*="shaymin"] .dark .pm-window.focused h3,
body[style*="shaymin"] .dark .pm-window.focused h3:hover {
    background: none;
    color: hsl(0, 0%, 100%);
}
body[style*="shaymin"] .pm-window.focused h3,
body[style*="shaymin"] .pm-window.focused .pm-log,
body[style*="shaymin"] .pm-window.focused .pm-log-add,
body[style*="shaymin"] .dark .pm-window.focused h3,
body[style*="shaymin"] .dark .pm-window.focused .pm-log,
body[style*="shaymin"] .dark .pm-window.focused .pm-log-add {
    border-color: hsla(0, 0%, 60%, 0.15);
}
body[style*="shaymin"] .pm-log,
body[style*="shaymin"] .dark .pm-log {
    color: hsl(0, 0%, 100%);
    background: none;
    border-color: hsla(0, 0%, 60%, 0.15);
    backdrop-filter: none;
}
body[style*="shaymin"] .news-embed .pm-log {
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
}
body[style*="shaymin"] .newsentry,
body[style*="shaymin"] .dark .newsentry {
    border-bottom: 1px solid hsla(0, 0%, 60%, 0.15);
}
body[style*="shaymin"] .newsentry:last-child {
    border-radius: inherit;
}
body[style*="shaymin"] .unread {
    background: none;
    box-shadow: inset 0 0 0 500px rgb(var(--yellow) / 40%);
}
body[style*="shaymin"] .pm-log-add,
body[style*="shaymin"] .dark .pm-log-add {
    background: none;
    border-color: hsla(0, 0%, 60%, 0.15);
    padding: 4px 4px 4px 0px;
}
body[style*="shaymin"] .pm-buttonbar button,
body[style*="shaymin"] .dark .pm-buttonbar button {
    background: none;
    border: none;
    color: hsl(0, 0%, 60%);
    transition: 0.15s;
}
body[style*="shaymin"] .pm-buttonbar button:hover,
body[style*="shaymin"] .dark .pm-buttonbar button:hover {
    background: none;
    color: hsl(0, 0%, 100%);
}
body[style*="shaymin"] .challenge {
    background: none;
    border-color: hsla(0, 0%, 60%, 0.15);
    border-top: none;
    color: hsl(0, 0%, 100%);
    margin-top: 0;
}
body[style*="shaymin"] .pm-minimized + .challenge {
    display: none;
}
body[style*="shaymin"]
    div[style="max-height: 222px ; overflow-y: auto ; color: #fff ; text-shadow: 1px 0 0 #000 , 0 -1px 0 #000 , 0 1px 0 #000 , -1px 0 0 #000"] {
    text-shadow: none !important;
    color: hsl(0, 0%, 100%) !important;
}
body[style*="shaymin"]
    table[style="border-collapse: collapse ; border: 1px solid #6688aa ; background-color: rgba(40 , 40 , 60 , 1) ; border-radius: 10px"] {
    background: none !important;
    border-radius: 0 !important;
    border-color: hsl(0, 0%, 60%) !important;
}
body[style*="shaymin"]
    th[style="border-bottom: 1px solid #94b8b8 ; padding: 5px"] {
    border-color: hsl(0, 0%, 60%);
}
body[style*="shaymin"]
    tr[style="width: auto ; background: rgb(35 , 35 , 100) ; background-attachment: fixed ; font-size: 14px"] {
    background: rgb(var(--yellow) / 40%) !important;
}
body[style*="shaymin"]
    tr[style="width: auto ; background: rgb(80 , 80 , 110) ; background-attachment: fixed ; font-size: 14px"] {
    background: hsla(330, 50%, 50%, 0.4) !important;
}
body[style*="shaymin"] .ladder table,
.ladder td,
.ladder th {
    border-color: hsl(0, 0%, 60%);
}
body[style*="shaymin"] .ladder th {
    background: hsla(0, 0%, 60%, 0.3);
    color: hsl(0, 0%, 100%);
}
body[style*="shaymin"] .ladder span {
    color: hsl(0, 0%, 60%);
}
body[style*="shaymin"] .folder.cur .selectFolder,
body[style*="shaymin"] .folder.cur .selectFolder:hover,
body[style*="shaymin"] .folder.cur .selectFolder:active,
body[style*="shaymin"] .dark .folder.cur .selectFolder,
body[style*="shaymin"] .dark .folder.cur .selectFolder:hover,
body[style*="shaymin"] .dark .folder.cur .selectFolder:active {
    background: rgb(var(--yellow) / 40%);
    color: hsl(0, 0%, 100%);
    border: 2px solid rgb(var(--yellow) / 40%);
    padding-top: 0px;
    padding-left: 7px;
    height: 35px;
}
body[style*="shaymin"] .selectFolder a,
body[style*="shaymin"] .dark .selectFolder a,
body[style*="shaymin"] .selectFolder a:visited,
body[style*="shaymin"] .dark .selectFolder a:visited {
    color: rgb(var(--yellow));
}
body[style*="shaymin"] .setchart-nickname,
body[style*="shaymin"] .dark .setchart-nickname {
    background: #a18100;
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
}
body[style*="shaymin"] .setchart,
body[style*="shaymin"] .dark .setchart {
    border-color: transparent;
    background-color: #a18100;
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
}
body[style*="shaymin"] .ps-room .setchart .textbox,
body[style*="shaymin"] .dark .setchart .textbox,
body[style*="shaymin"] .ps-room .setchart-nickname .textbox,
body[style*="shaymin"] .dark .setchart-nickname .textbox {
    background: #00000085;
    box-shadow: inset 0 2px 3px hsla(0, 0%, 0%, 0.1);
}
body[style*="shaymin"] .ps-room .setchart .textbox:hover,
body[style*="shaymin"] .dark .setchart .textbox:hover,
body[style*="shaymin"] .ps-room .setchart-nickname .textbox:hover,
body[style*="shaymin"] .dark .setchart-nickname .textbox:hover {
    background: #00000052;
    box-shadow: inset 0 2px 3px hsla(0, 0%, 0%, 0.1);
}
body[style*="shaymin"] .ps-room .setchart .textbox:focus,
body[style*="shaymin"] .dark .setchart .textbox:focus,
body[style*="shaymin"] .ps-room .setchart-nickname .textbox:focus,
body[style*="shaymin"] .dark .setchart-nickname .textbox:focus {
    background: #0000004f;
    box-shadow: inset 0 2px 3px hsla(0, 0%, 0%, 0.1);
}
@keyframes shift-solid {
    0% {
        background: #0000004f;
    }
    50% {
        background: #0000009c;
    }
    100% {
        background: #0000004f;
    }
}
body[style*="shaymin"] .setchart .textbox:disabled:hover,
body[style*="shaymin"] .dark .setchart .textbox:disabled:hover,
body[style*="shaymin"] .setchart-nickname .textbox:disabled:hover,
body[style*="shaymin"] .dark .setchart-nickname .textbox:disabled:hover {
    background: #a18100;
}
body[style*="shaymin"] .setcol-icon label,
body[style*="shaymin"] .dark .setcol-icon label {
    text-shadow: #a18100 1px 1px 0, #a18100 1px -1px 0, #a18100 -1px 1px 0,
        #a18100 -1px -1px 0;
}
body[style*="shaymin"] .setchart input.incomplete {
    color: #a18100;
    border-color: transparent;
}
body[style*="shaymin"] .utilichart h3,
body[style*="shaymin"] .dexentry h3,
body[style*="shaymin"] .resultheader h3,
body[style*="shaymin"] .dark .utilichart h3,
body[style*="shaymin"] .dark .dexentry h3,
body[style*="shaymin"] .dark .resultheader h3 {
    font-family: "Lexend", sans-serif !important;
    color: hsl(0, 0%, 100%);
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
    text-shadow: none;
    background: #a18100;
    border: 2px solid transparent;
    border-radius: 6px;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    inset: 0;
    width: 685px;
    box-sizing: border-box;
}
body[style*="shaymin"] .utilichart .sortrow {
    border: none;
    border-radius: 6px;
    background: #a18100;
    height: 100%;
    width: 685px;
    box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.2);
}
body[style*="shaymin"] .utilichart .sortcol.cur,
body[style*="shaymin"] .utilichart .sortcol:hover,
body[style*="shaymin"] .utilichart .sortcol:focus-visible,
body[style*="shaymin"] .utilichart .sortcol.numsortcol.cur,
body[style*="shaymin"] .utilichart .sortcol.numsortcol.cur:hover {
    background: rgb(var(--yellow) / 80%);
    outline: transparent;
    border-radius: 4px;
    height: 25px;
}
body[style*="shaymin"] .utilichart .sortcol.cur:focus-visible {
    background: rgb(var(--yellow) / 67%);
}
body[style*="shaymin"] .utilichart b {
    color: rgb(var(--yellow));
}
body[style*="shaymin"] .utilichart .filtercol em {
    color: rgb(var(--yellow));
    border-color: transparent;
    border-radius: 6px;
    background: rgb(var(--yellow) / 20%);
}
body[style*="shaymin"] .utilichart .filter:hover i,
body[style*="shaymin"] .searchboxwrapper .filter:hover i,
body[style*="shaymin"] .utilichart .filter:focus-visible i,
body[style*="shaymin"] .searchboxwrapper .filter:focus-visible i {
    color: rgb(var(--yellow));
}
body[style*="shaymin"] .teambuilder-clipboard-data,
body[style*="shaymin"] .dark .teambuilder-clipboard-data {
    right: auto;
    border: none;
    background: #a18100;
    color: hsl(0, 0%, 100%);
    transition: 0.15s;
    border-radius: 6px;
}
body[style*="shaymin"] .teambuilder-clipboard-data:hover {
    background: rgb(var(--yellow) / 80%);
    border: none;
}
body[style*="shaymin"] .teambar button:hover,
body[style*="shaymin"] .dark .teambar button:hover,
body[style*="shaymin"] .teambar button:focus-visible {
    background: none;
    border: none;
    border-bottom: 2px solid rgb(var(--yellow) / 40%);
    height: 50px;
    transform: translateY(0px);
}
body[style*="shaymin"] .teambar button:disabled,
body[style*="shaymin"] .teambar button:disabled:hover,
body[style*="shaymin"] .teambar button:disabled:active,
body[style*="shaymin"] .dark .teambar button:disabled,
body[style*="shaymin"] .dark .teambar button:disabled:hover,
body[style*="shaymin"] .dark .teambar button:disabled:active {
    background: none;
    border-color: rgb(var(--yellow));
    opacity: 1;
    transform: translateY(0px);
}
body[style*="shaymin"] .blocklink:hover,
body[style*="shaymin"] .dark .blocklink:hover,
body[style*="shaymin"] .blocklink:focus-visible {
    background: rgb(var(--yellow) / 40%);
    color: hsl(0, 0%, 100%);
    border: 2px solid rgb(var(--yellow) / 40%);
    outline: transparent;
}
body[style*="shaymin"] .select:hover,
body[style*="shaymin"] .team:hover,
body[style*="shaymin"] .dark .select:hover,
body[style*="shaymin"] .dark .team:hover,
body[style*="shaymin"] .select:active,
body[style*="shaymin"] .team:active,
body[style*="shaymin"] .dark .select:active,
body[style*="shaymin"] .dark .team:active,
body[style*="shaymin"] .select:focus-visible,
body[style*="shaymin"] .team:focus-visible,
body[style*="shaymin"] .dark .select:hover,
body[style*="shaymin"] .dark .select:hover .team,
body[style*="shaymin"] .dark a.team:hover,
body[style*="shaymin"] .dark button.team:hover {
    background: rgb(var(--yellow) / 60%);
    color: hsl(0, 0%, 100%);
    box-shadow: 0 0 10px rgb(var(--yellow) / 40%);
}
body[style*="shaymin"] .popupmenu strong,
.popupmenu h3 {
    color: rgb(var(--yellow)) !important;
}
body[style*="shaymin"] .popupmenu i {
    color: rgb(var(--yellow)) !important;
    text-shadow: none !important;
}
body[style*="shaymin"] i.subtle {
    color: hsla(0, 0%, 60%, 0.15) !important;
    opacity: 1 !important;
    transition: 0.15s;
}
body[style*="shaymin"] i.subtle:hover {
    color: rgb(var(--yellow) / 40%) !important;
    opacity: 1 !important;
}
body[style*="shaymin"] input[type="range"]::-webkit-slider-thumb {
    background: rgb(var(--yellow));
}
body[style*="shaymin"] input[type="range"]:hover::-webkit-slider-thumb {
    background: rgb(var(--yellow));
    border-color: rgb(var(--yellow));
}
body[style*="shaymin"] input[type="range"]:focus::-webkit-slider-thumb {
    border-color: rgb(var(--yellow));
}
body[style*="shaymin"] input[type="range"]:active::-webkit-slider-thumb {
    border-color: rgb(var(--yellow));
    box-shadow: 0 0 0 3px rgb(var(--yellow) / 40%);
}
body[style*="shaymin"] button[name="copySet"]:hover::before,
body[style*="shaymin"] button[name="importSet"]:hover::before,
body[style*="shaymin"] button[name="moveSet"]:hover::before,
body[style*="shaymin"] button[name="deleteSet"]:hover::before,
body[style*="shaymin"] button[name="edit"]:hover::before,
body[style*="shaymin"] button[name="duplicate"]:hover::before,
body[style*="shaymin"] button[name="delete"]:hover::before {
    background-color: rgb(var(--yellow)) !important;
}
#room-rooms {
    backdrop-filter: blur(5px);
    width: 500px !important;
    overflow-x: hidden !important;
    margin-left: 1046px;
}
#room-rooms-panel {
    position: fixed !important;
    top: 56px !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 1034px !important;
    height: auto !important;
    margin: 6px !important;
    padding: 0 !important;
    box-sizing: border-box !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
    color: #fff !important;
    border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
    font-family: "Lexend", sans-serif !important;
    backdrop-filter: blur(6px) !important;
    border-radius: 6px !important;
}
#room-rooms-panel .rooms-tabs {
    flex: 0 0 38px !important;
    height: 38px !important;
    min-height: 38px !important;
    width: 100% !important;
    display: flex !important;
    align-items: stretch !important;
    gap: 3px !important;
    padding: 5px 7px 0 !important;
    box-sizing: border-box !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    background: rgba(0, 0, 0, 0.52) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.09) !important;
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
}
#room-rooms-panel .rooms-tabs::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
}
#room-rooms-panel .rooms-tab {
    flex: 0 0 auto !important;
    max-width: 190px !important;
    min-width: 74px !important;
    height: 33px !important;
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
    padding: 0 7px 0 11px !important;
    box-sizing: border-box !important;
    border: 1px solid transparent !important;
    border-bottom: 0 !important;
    border-radius: 7px 7px 0 0 !important;
    background: rgba(255, 255, 255, 0.045) !important;
    color: rgba(255, 255, 255, 0.58) !important;
    cursor: pointer !important;
    user-select: none !important;
    font-family: "Lexend", sans-serif !important;
    font-size: 10px !important;
    font-weight: 500 !important;
    transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease !important;
}
#room-rooms-panel .rooms-tab:hover {
    background: rgba(255, 255, 255, 0.09) !important;
    color: #fff !important;
}
#room-rooms-panel .rooms-tab.active {
    background: rgba(25, 25, 29, 0.96) !important;
    border-color: rgba(255, 255, 255, 0.12) !important;
    color: #fff !important;
    box-shadow: 0 -1px 10px rgba(0, 0, 0, 0.15) !important;
}
#room-rooms-panel .rooms-tab-name {
    flex: 1 1 auto !important;
    min-width: 0 !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
    font-family: "Lexend", sans-serif !important;
}
#room-rooms-panel .rooms-tab-close {
    flex: 0 0 19px !important;
    width: 19px !important;
    height: 19px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    border: 0 !important;
    border-radius: 5px !important;
    background: transparent !important;
    color: rgba(255, 255, 255, 0.45) !important;
    cursor: pointer !important;
    font-family: "Lexend", sans-serif !important;
    font-size: 14px !important;
    line-height: 1 !important;
    padding: 0 !important;
}
#room-rooms-panel .rooms-tab-close:hover {
    background: rgba(255, 255, 255, 0.13) !important;
    color: #fff !important;
}
#room-rooms-panel .rooms-tab-add {
    flex: 0 0 31px !important;
    width: 31px !important;
    height: 33px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    border: 0 !important;
    border-radius: 7px 7px 0 0 !important;
    background: transparent !important;
    color: rgba(255, 255, 255, 0.65) !important;
    cursor: pointer !important;
    font-family: "Lexend", sans-serif !important;
    font-size: 22px !important;
    font-weight: 300 !important;
    line-height: 1 !important;
    padding: 0 !important;
}
#room-rooms-panel .rooms-tab-add:hover {
    background: rgba(255, 255, 255, 0.09) !important;
    color: #fff !important;
}
#room-rooms-panel .rooms-url-bar {
    flex: 0 0 46px !important;
    height: 46px !important;
    min-height: 46px !important;
    width: 100% !important;
    display: flex !important;
    align-items: center !important;
    gap: 7px !important;
    padding: 7px 9px !important;
    box-sizing: border-box !important;
    background: rgba(0, 0, 0, 0.4) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.09) !important;
}
#room-rooms-panel .rooms-url {
    flex: 1 1 auto !important;
    min-width: 0 !important;
    width: 100% !important;
    height: 32px !important;
    padding: 0 10px !important;
    box-sizing: border-box !important;
    border: 1px solid rgba(255, 255, 255, 0.13) !important;
    border-radius: 6px !important;
    outline: none !important;
    background: rgba(255, 255, 255, 0.06) !important;
    color: rgba(255, 255, 255, 0.92) !important;
    font-family: "Lexend", sans-serif !important;
    font-size: 11px !important;
    font-weight: 400 !important;
}
#room-rooms-panel .rooms-url:focus {
    border-color: rgba(255, 255, 255, 0.28) !important;
    background: rgba(255, 255, 255, 0.09) !important;
}
#room-rooms-panel .rooms-url::placeholder {
    color: rgba(255, 255, 255, 0.38) !important;
}
#room-rooms-panel .rooms-url-search {
    flex: 0 0 60px !important;
    width: 60px !important;
    height: 32px !important;
    box-sizing: border-box !important;
    border: 1px solid rgba(255, 255, 255, 0.13) !important;
    border-radius: 6px !important;
    background: rgba(255, 255, 255, 0.07) !important;
    color: rgba(255, 255, 255, 0.78) !important;
    font-family: "Lexend", sans-serif !important;
    font-size: 10px !important;
    font-weight: 500 !important;
    cursor: pointer !important;
    padding: 0 !important;
    transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease !important;
}
#room-rooms-panel .rooms-url-search:hover {
    background: rgba(255, 255, 255, 0.12) !important;
    color: #fff !important;
    border-color: rgba(255, 255, 255, 0.2) !important;
}
#room-rooms-panel .rooms-content {
    flex: 1 1 auto !important;
    min-height: 0 !important;
    min-width: 0 !important;
    width: 100% !important;
    height: auto !important;
    position: relative !important;
    overflow: hidden !important;
    background: transparent !important;
}
#room-rooms-panel .rooms-iframe {
    position: absolute !important;
    inset: 0 !important;
    width: 1022px !important;
    height: 100% !important;
    min-width: 0 !important;
    min-height: 0 !important;
    border: 0 !important;
    outline: none !important;
    margin: 6px !important;
    border-radius: 6px !important;
    padding: 0 !important;
    display: block !important;
    background: #fff !important;
}
#room-rooms-panel .ps-pp-404 {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    box-sizing: border-box !important;
    padding: 30px !important;
    text-align: center !important;
    overflow: hidden !important;
}
#room-rooms-panel .ps-pp-404-image {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100% !important;
    margin-bottom: 12px !important;
}
#room-rooms-panel .ps-pp-404-image img {
    display: block !important;
    max-width: 260px !important;
    width: auto !important;
    height: auto !important;
    max-height: 220px !important;
    object-fit: contain !important;
}
#room-rooms-panel .ps-pp-404-txt {
    color: rgba(255, 255, 255, 0.78) !important;
    font-family: "Lexend", sans-serif !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    line-height: 1.5 !important;
    margin: 4px 0 !important;
}
#room-rooms-panel .ps-pp-404-title {
    color: rgba(255, 255, 255, 0.95) !important;
    font-family: "Lexend", sans-serif !important;
    font-size: 18px !important;
    font-weight: 600 !important;
    line-height: 1.4 !important;
    margin: 4px 0 18px !important;
}
#room-rooms-panel .ps-pp-404-buttons {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 10px !important;
    flex-wrap: wrap !important;
}
#room-rooms-panel .ps-pp-404-buttons .button {
    font-family: "Lexend", sans-serif !important;
}
#room-rooms-panel .ps-pp-force-image {
    position: absolute !important;
    inset: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    overflow: hidden !important;
    background: rgba(0, 0, 0, 0.9) !important;
}
#room-rooms-panel .ps-pp-force-image video {
    width: 100% !important;
    height: 100% !important;
    max-width: 100% !important;
    max-height: 100% !important;
    object-fit: contain !important;
    display: block !important;
}
.psr-guide {
    --psr-blue: #3b82f6;
    --psr-cyan: #06d6f5;
    --psr-green: #22c55e;
    --psr-purple: #8b5cf6;
    --psr-pink: #ec4899;
    --psr-red: #f43f5e;
    --psr-orange: #f97316;
    --psr-text: #ddd;
    --psr-muted: rgba(255, 255, 255, 0.68);
    --psr-faint: rgba(255, 255, 255, 0.46);
    --psr-border: rgba(255, 255, 255, 0.1);
    max-width: 1120px;
    margin: 0 auto;
    padding: 10px 18px 0px;
    box-sizing: border-box;
    color: var(--psr-text);
    overflow: hidden;
    font-family: "lexend";
}
.psr-guide h2,
.psr-guide h3,
.psr-guide h4 {
    line-height: 1.25;
}
.psr-guide p,
.psr-guide li {
    line-height: 1.7;
}
.psr-guide a,
.psr-guide button,
.psr-guide img,
.psr-guide .psr-card,
.psr-guide .psr-feature-image,
.psr-guide .psr-credit-person {
    -webkit-tap-highlight-color: transparent;
}
.psr-guide strong {
    color: white;
}
.psr-hero {
    position: relative;
    text-align: center;
    padding: 36px 15px 52px;
    margin-bottom: 6px;
}
.psr-hero::before {
    content: "";
    position: absolute;
    left: 8%;
    right: 8%;
    bottom: 0;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(
        90deg,
        var(--psr-blue),
        var(--psr-cyan),
        var(--psr-green),
        var(--psr-orange),
        var(--psr-pink),
        var(--psr-purple)
    );
    box-shadow: 0 0 18px rgba(59, 130, 246, 0.32),
        0 0 28px rgba(236, 72, 153, 0.14);
    background-size: 200% 100%;
    animation: psr-gradient-flow 7s linear infinite;
}
@keyframes psr-gradient-flow {
    from {
        background-position: 0% 50%;
    }
    to {
        background-position: 200% 50%;
    }
}
.psr-hero-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    flex-wrap: wrap;
    margin-bottom: 19px;
}
.psr-hero-logo img {
    width: auto;
    height: 58px;
    max-width: 100%;
    object-fit: contain;
    filter: drop-shadow(0 5px 15px rgba(59, 130, 246, 0.28));
    animation: psr-logo-float 4s ease-in-out infinite;
}
@keyframes psr-logo-float {
    0%,
    100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-4px);
    }
}
.psr-hero h2, .psr-welcome-hero h2 {
    margin: 0;
    font-size: 34px;
    font-weight: 900;
    letter-spacing: -0.5px;
    background: linear-gradient(
        90deg,
        #60a5fa,
        #22d3ee,
        #34d399,
        #f472b6,
        #a78bfa
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    background-size: 200% 100%;
    animation: psr-gradient-flow 8s linear infinite;
}
.psr-hero p {
    max-width: 790px;
    margin: 12px auto;
}
.psr-hero-subtitle {
    color: #67e8f9;
    font-size: 15px;
    font-weight: 700;
}
.psr-section {
    position: relative;
    padding: 42px 0;
}
.psr-section + .psr-section {
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.psr-section + .psr-section::before {
    content: "";
    position: absolute;
    top: -2px;
    left: 50%;
    width: 92px;
    height: 3px;
    transform: translateX(-50%);
    border-radius: 999px;
    background: linear-gradient(
        90deg,
        var(--psr-blue),
        var(--psr-cyan),
        var(--psr-purple)
    );
    box-shadow: 0 0 13px rgba(59, 130, 246, 0.24);
}
.psr-section > h2 {
    margin-top: 0;
    margin-bottom: 12px;
    font-size: 26px;
}
.psr-section > h2::after {
    content: "";
    display: block;
    width: 72px;
    height: 3px;
    margin-top: 10px;
    border-radius: 999px;
    background: linear-gradient(
        90deg,
        var(--psr-blue),
        var(--psr-cyan),
        var(--psr-purple)
    );
}
.psr-guide.psr-animate .psr-reveal {
    opacity: 0;
    transform: translate3d(0, 24px, 0) scale(0.992);
    transition: opacity 0.62s cubic-bezier(0.22, 0.61, 0.36, 1),
        transform 0.62s cubic-bezier(0.22, 0.61, 0.36, 1);
    will-change: opacity, transform;
}
.psr-guide.psr-animate .psr-reveal.psr-in-view {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
}
.psr-guide.psr-animate .psr-reveal-left {
    opacity: 0;
    transform: translate3d(-30px, 0, 0);
    transition: opacity 0.68s cubic-bezier(0.22, 0.61, 0.36, 1),
        transform 0.68s cubic-bezier(0.22, 0.61, 0.36, 1);
    will-change: opacity, transform;
}
.psr-guide.psr-animate .psr-reveal-right {
    opacity: 0;
    transform: translate3d(30px, 0, 0);
    transition: opacity 0.68s cubic-bezier(0.22, 0.61, 0.36, 1),
        transform 0.68s cubic-bezier(0.22, 0.61, 0.36, 1);
    will-change: opacity, transform;
}
.psr-guide.psr-animate .psr-reveal-left.psr-in-view,
.psr-guide.psr-animate .psr-reveal-right.psr-in-view {
    opacity: 1;
    transform: translate3d(0, 0, 0);
}
.psr-guide.psr-animate .psr-stagger > * {
    opacity: 0;
    transform: translate3d(0, 16px, 0);
    transition: opacity 0.5s cubic-bezier(0.22, 0.61, 0.36, 1),
        transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
    will-change: opacity, transform;
}
.psr-guide.psr-animate .psr-stagger.psr-in-view > * {
    opacity: 1;
    transform: translate3d(0, 0, 0);
}
.psr-guide.psr-animate .psr-stagger.psr-in-view > *:nth-child(1) {
    transition-delay: 0.03s;
}
.psr-guide.psr-animate .psr-stagger.psr-in-view > *:nth-child(2) {
    transition-delay: 0.08s;
}
.psr-guide.psr-animate .psr-stagger.psr-in-view > *:nth-child(3) {
    transition-delay: 0.13s;
}
.psr-guide.psr-animate .psr-stagger.psr-in-view > *:nth-child(4) {
    transition-delay: 0.18s;
}
.psr-guide.psr-animate .psr-stagger.psr-in-view > *:nth-child(5) {
    transition-delay: 0.23s;
}
.psr-guide.psr-animate .psr-stagger.psr-in-view > *:nth-child(6) {
    transition-delay: 0.28s;
}
@media (prefers-reduced-motion: reduce) {
    .psr-guide.psr-animate .psr-reveal,
    .psr-guide.psr-animate .psr-reveal-left,
    .psr-guide.psr-animate .psr-reveal-right,
    .psr-guide.psr-animate .psr-stagger > * {
        opacity: 1;
        transform: none;
        transition: none;
    }
    .psr-hero-logo img,
    .psr-hero::before,
    .psr-hero h2,  .psr-welcome-hero h2  {
        animation: none;
    }
}
.psr-feature {
    display: grid;
    grid-template-columns:
        minmax(0, 1fr)
        minmax(300px, 440px);
    gap: 42px;
    align-items: center;
    padding: 32px 0;
}
.psr-feature + .psr-feature {
    border-top: 1px solid rgba(255, 255, 255, 0.055);
}
.psr-feature.reverse {
    grid-template-columns:
        minmax(300px, 440px)
        minmax(0, 1fr);
}
.psr-feature-content {
    min-width: 0;
}
.psr-feature-content h3 {
    margin-top: 0;
    margin-bottom: 12px;
    font-size: 22px;
    color: #fff;
    text-shadow: 0 0 15px rgba(59, 130, 246, 0.12);
}
.psr-feature-content p {
    line-height: 1.76;
}
.psr-feature-content ul,
.psr-feature-content ol {
    margin-top: 14px;
    padding-left: 23px;
}
.psr-feature-content li {
    margin: 6px 0;
}
.psr-feature-content li::marker {
    color: #22d3ee;
}
.about-us-image {
    max-height: 330px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
    border-radius: 17px;
    border: 1px solid rgba(96, 250, 163, 0.22);
    box-shadow: 0 13px 38px rgba(0, 0, 0, 0.2),
        inset 0 0 38px rgba(59, 130, 246, 0.035);
    transition: transform 0.35s ease, border-color 0.35s ease,
        box-shadow 0.35s ease;
}
.about-us-image img {
    background-size: cover;
    position: relative;
    z-index: 1;
    display: block;
    width: 100%;
    object-fit: contain;
    border-radius: 12px;
    transition: transform 0.45s ease;
}
.about-us-image img:hover {
    transform: scale(1.04);
}
.psr-feature-image {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
    border-radius: 8px;
    background: linear-gradient(
        135deg,
        rgba(59, 130, 246, 0.11),
        rgba(6, 182, 212, 0.06),
        rgba(139, 92, 246, 0.09),
        rgba(236, 72, 153, 0.05)
    );
    border: 1px solid rgba(96, 165, 250, 0.22);
    box-shadow: 0 13px 38px rgba(0, 0, 0, 0.2),
        inset 0 0 38px rgba(59, 130, 246, 0.035);
    transition: transform 0.35s ease, border-color 0.35s ease,
        box-shadow 0.35s ease;
}
.psr-feature-image::before {
    content: "";
    position: absolute;
    inset: -45%;
    background: conic-gradient(
        from 0deg,
        transparent,
        rgba(59, 130, 246, 0.11),
        transparent,
        rgba(236, 72, 153, 0.09),
        transparent
    );
    animation: psr-image-orbit 12s linear infinite;
    pointer-events: none;
}
@keyframes psr-image-orbit {
    to {
        transform: rotate(360deg);
    }
}
.psr-feature-image:hover {
    transform: translateY(-5px);
    border-color: rgba(34, 211, 238, 0.48);
    box-shadow: 0 19px 45px rgba(0, 0, 0, 0.25),
        0 0 28px rgba(59, 130, 246, 0.12);
}
.psr-feature-image img {
    position: relative;
    z-index: 1;
    display: block;
    width: 100%;
    max-height: 330px;
    object-fit: contain;
    border-radius: 12px;
    transition: transform 0.45s ease;
}
.psr-feature-image img:hover {
    transform: scale(1.04);
}
.psr-card-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    margin-top: 24px;
}
.psr-card {
    position: relative;
    padding: 22px;
    border-radius: 15px;
    background: linear-gradient(
        145deg,
        rgba(255, 255, 255, 0.055),
        rgba(255, 255, 255, 0.015)
    );
    border: 1px solid rgba(255, 255, 255, 0.09);
    overflow: hidden;
    transition: transform 0.28s ease, border-color 0.28s ease,
        box-shadow 0.28s ease;
}
.psr-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(
        90deg,
        var(--psr-blue),
        var(--psr-cyan),
        var(--psr-purple)
    );
}
.psr-card:nth-child(2)::before {
    background: linear-gradient(90deg, var(--psr-cyan), var(--psr-green));
}
.psr-card:nth-child(3)::before {
    background: linear-gradient(90deg, var(--psr-orange), var(--psr-red));
}
.psr-card:nth-child(4)::before {
    background: linear-gradient(90deg, var(--psr-pink), var(--psr-purple));
}
.psr-card:nth-child(5)::before {
    background: linear-gradient(90deg, #f5615f, #6fcac9);
}
.psr-card:nth-child(6)::before {
    background: linear-gradient(90deg, #3fb0da, #222476);
}
.psr-card:hover {
    transform: translateY(-5px);
    border-color: rgba(96, 165, 250, 0.3);
    box-shadow: 0 13px 31px rgba(0, 0, 0, 0.2),
        0 0 21px rgba(59, 130, 246, 0.08);
}
.psr-card h4 {
    margin-top: 0;
    margin-bottom: 8px;
    color: #fff;
}
.psr-card p {
    margin-bottom: 0;
    color: var(--psr-muted);
}
.psr-howto {
    margin: 27px 0 10px;
    border-radius: 17px;
    overflow: hidden;
    background: linear-gradient(
        135deg,
        rgba(59, 130, 246, 0.09),
        rgba(6, 182, 212, 0.06),
        rgba(139, 92, 246, 0.08),
        rgba(236, 72, 153, 0.04)
    );
    border: 1px solid rgba(96, 165, 250, 0.22);
    box-shadow: 0 11px 32px rgba(0, 0, 0, 0.18),
        0 0 25px rgba(59, 130, 246, 0.05);
}
.psr-howto.open {
    border-color: rgba(34, 211, 238, 0.4);
    box-shadow: 0 14px 38px rgba(0, 0, 0, 0.22),
        0 0 28px rgba(59, 130, 246, 0.1);
}
.psr-howto-toggle {
    width: 100%;
    padding: 17px 20px;
    border: 0;
    background: linear-gradient(
        90deg,
        rgba(59, 130, 246, 0.14),
        rgba(6, 182, 212, 0.1),
        rgba(139, 92, 246, 0.12)
    );
    color: #fff;
    cursor: pointer;
    font: inherit;
    font-weight: 800;
    text-align: left;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
}
.psr-howto-toggle:hover {
    background: linear-gradient(
        90deg,
        rgba(59, 130, 246, 0.21),
        rgba(6, 182, 212, 0.15),
        rgba(139, 92, 246, 0.18)
    );
}
.psr-howto-toggle > span:last-child {
    width: 31px;
    height: 31px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 9px;
    background: rgba(34, 211, 238, 0.13);
    color: #67e8f9;
    transition: transform 0.3s ease, background 0.2s ease;
}
.psr-howto.open .psr-howto-toggle > span:last-child {
    transform: rotate(180deg);
    background: rgba(139, 92, 246, 0.18);
}
.psr-howto-content {
    display: block;
    opacity: 1;
}
.psr-howto-inner {
    min-height: 0;
    overflow: hidden;
}
.psr-howto-body {
    height: 320px;
    display: grid;
    grid-template-columns:
        minmax(0, 1fr)
        minmax(280px, 390px);
    gap: 30px;
    padding: 25px 22px 8px;
    align-items: center;
}
.psr-howto-text {
    min-width: 0;
}
.psr-howto-slide {
    display: none;
    animation: psr-slide-in 0.35s ease;
}
.psr-howto-slide.active {
    display: block;
}
@keyframes psr-slide-in {
    from {
        opacity: 0;
        transform: translateX(14px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}
.psr-howto-step {
    margin-bottom: 14px;
}
.psr-howto-step strong {
    display: inline-block;
    margin-bottom: 10px;
    padding: 5px 11px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 900;
    color: #fff;
    background: linear-gradient(90deg, var(--psr-blue), var(--psr-purple));
    box-shadow: 0 5px 15px rgba(59, 130, 246, 0.18);
}
.psr-howto-step p {
    margin: 0;
    line-height: 1.76;
    color: var(--psr-muted);
}
.psr-howto-image {
    display: flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    overflow: hidden;
    border-radius: 8px;
    background: linear-gradient(
        135deg,
        rgba(59, 130, 246, 0.08),
        rgba(236, 72, 153, 0.06)
    );
    border: 1px solid rgba(96, 165, 250, 0.17);
}
.psr-howto-image img {
    display: block;
    width: 100%;
    max-height: 280px;
    object-fit: contain;
    border-radius: 10px;
    transition: transform 0.4s ease;
}
.psr-howto-image img:hover {
    transform: scale(1.025);
}
.psr-howto-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 13px;
    margin: 18px 22px 0;
    padding: 14px 0 0;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.psr-howto-controls button {
    min-width: 110px;
    padding: 10px 16px;
    border: 1px solid rgba(96, 165, 250, 0.3);
    border-radius: 9px;
    background: linear-gradient(
        135deg,
        rgba(59, 130, 246, 0.16),
        rgba(139, 92, 246, 0.14)
    );
    color: #fff;
    font: inherit;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    transition: background 0.2s ease, border-color 0.2s ease,
        transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}
.psr-howto-controls button:hover:not(:disabled) {
    transform: translateY(-2px);
    border-color: rgba(34, 211, 238, 0.55);
    background: linear-gradient(
        135deg,
        rgba(59, 130, 246, 0.28),
        rgba(139, 92, 246, 0.25)
    );
    box-shadow: 0 7px 18px rgba(59, 130, 246, 0.15);
}
.psr-howto-controls button:disabled {
    opacity: 0.3;
    cursor: default;
}
.psr-howto-prev,
.psr-howto-next {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
}
.psr-howto-arrow {
    width: 12px;
    height: 12px;
    flex: 0 0 12px;
    display: block;
    fill: #fff !important;
    transition: transform .2s ease;
}
.psr-howto-prev:hover .psr-howto-arrow {
    transform: translateX(-2px) scale(1.1);
}
.psr-howto-next:hover .psr-howto-arrow {
    transform: translateX(2px) scale(1.1);
}
.psr-howto-counter {
    min-width: 95px;
    text-align: center;
    font-size: 12px;
    font-weight: 800;
    color: #67e8f9;
}
.psr-howto-dots {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    margin: 12px 0 18px;
}
.psr-howto-dots span {
    width: 7px;
    height: 7px;
    display: block;
    border-radius: 50%;
    background: #22d3ee;
    opacity: 0.25;
    cursor: pointer;
    transition: width 0.2s ease, opacity 0.2s ease, transform 0.2s ease;
}
.psr-howto-dots span:hover {
    opacity: 0.65;
    transform: scale(1.2);
}
.psr-howto-dots span.active {
    width: 22px;
    border-radius: 6px;
    opacity: 1;
    background: linear-gradient(90deg, var(--psr-blue), var(--psr-purple));
    box-shadow: 0 0 9px rgba(59, 130, 246, 0.35);
}
.psr-feedback {
    max-width: 720px;
    margin: 28px auto 12px;
    padding: 28px;
    border-radius: 17px;
    background: linear-gradient(
        135deg,
        rgba(59, 130, 246, 0.075),
        rgba(139, 92, 246, 0.06),
        rgba(236, 72, 153, 0.045)
    );
    border: 1px solid rgba(96, 165, 250, 0.17);
    box-shadow: 0 13px 37px rgba(0, 0, 0, 0.17);
    box-sizing: border-box;
}
.psr-feedback h3 {
    margin-top: 0;
    margin-bottom: 8px;
    color: #fff;
}
.psr-feedback > p {
    margin-top: 0;
    line-height: 1.65;
    color: var(--psr-muted);
}
.psr-feedback label {
    display: block;
    margin: 18px 0 7px;
    font-size: 13px;
    font-weight: 800;
    color: #fff;
}
.psr-feedback input,
.psr-feedback select,
.psr-feedback textarea {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid rgba(96, 165, 250, 0.21);
    border-radius: 9px;
    background: rgba(255, 255, 255, 0.035);
    color: inherit;
    font: inherit;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease,
        background 0.2s ease, opacity 0.2s ease;
}
.psr-feedback input {
    padding: 11px 13px;
    cursor: default;
}
.psr-feedback input:focus,
.psr-feedback select:focus,
.psr-feedback textarea:focus {
    border-color: rgba(34, 211, 238, 0.58);
    box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.08);
}
.psr-feedback input:disabled,
.psr-feedback select:disabled,
.psr-feedback textarea:disabled,
.psr-feedback button[type="submit"]:disabled {
    opacity: 0.48;
    cursor: not-allowed;
}
.psr-feedback input:disabled {
    background: rgba(255, 255, 255, 0.025);
}
.psr-feedback-status {
    min-height: 17px;
    margin: 10px 0 0;
    font-size: 12px;
    font-weight: 700;
    color: rgba(167, 243, 208, 0.9);
}
.psr-feedback select,
.psr-feedback textarea {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid rgba(96, 165, 250, 0.21);
    border-radius: 9px;
    background: rgba(255, 255, 255, 0.035);
    color: inherit;
    font: inherit;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.psr-feedback select {
    padding: 11px 13px;
}
.psr-feedback textarea {
    min-height: 125px;
    padding: 12px 13px;
    resize: vertical;
}
.psr-feedback textarea:hover {
    background-color: rgba(255, 255, 255, 0.06);
}
.psr-feedback select:hover,
.psr-feedback textarea:hover {
    border-color: rgba(34, 211, 238, 0.34);
}
.psr-feedback select:focus,
.psr-feedback textarea:focus {
    border-color: rgba(34, 211, 238, 0.58);
    box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.08);
}
.psr-feedback select option {
    background: #20242c;
    color: #fff;
}
.psr-feedback textarea::placeholder {
    opacity: 0.45;
}
.psr-feedback button[type="submit"] {
    margin-top: 18px;
    padding: 11px 21px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 9px;
    background: rgba(255, 255, 255, 0.055);
    color: rgba(245, 248, 255, 0.92);
    font: inherit;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.14);
    transition: background 0.2s ease, border-color 0.2s ease,
        box-shadow 0.25s ease, color 0.2s ease;
    transform: none;
}
.psr-feedback button[type="submit"]:hover {
    background: rgba(75, 145, 235, 0.45);
    border-color: rgba(90, 165, 255, 0.42);
    color: #ffffff;
    box-shadow: 0 0 8px rgba(70, 145, 255, 0.18),
        0 0 20px rgba(70, 145, 255, 0.08);
    transform: none;
}
.psr-credits {
    max-width: 900px;
    margin: 32px auto 0;
    padding: 35px 20px;
    text-align: center;
    border-top: 1px solid var(--psr-border);
}
.psr-credits h3 {
    margin: 0 0 10px;
    font-size: 21px;
    color: #fff;
}
.psr-credits-intro {
    margin: 0 auto 24px;
    line-height: 1.65;
    color: var(--psr-muted);
}
.psr-credits-grid {
    display: grid;
    padding: 0px 150px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
}
.psr-credit-person {
    position: relative;
    padding: 17px 13px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid rgba(255, 255, 255, 0.08);
    overflow: hidden;
    transition: transform 0.22s ease, border-color 0.22s ease,
        box-shadow 0.22s ease;
}
.psr-credit-person::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #BC2461, #501E36);
}
.psr-credit-person:nth-child(2)::before {
    background: linear-gradient(90deg, #578D35, #2C4327);
}
.psr-credit-person:nth-child(3)::before {
    background: linear-gradient(90deg, var(--psr-orange), var(--psr-red));
}
.psr-credit-person:hover {
    transform: translateY(-3px);
    border-color: rgba(96, 165, 250, 0.28);
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.15);
}
.psr-credit-name {
    display: block;
    margin-bottom: 5px;
    font-size: 14px;
    font-weight: 800;
}
.psr-credit-role {
    display: block;
    font-size: 11px;
    color: #8d8d8d;
    font-weight: 600;
}
.psr-resources {
    margin-top: 18px;
    margin-bottom: 18px;
    padding: 15px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.07);
}
.psr-resources-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    margin-bottom: 13px;
    font-size: 13px;
    color: #cfcfcf;
}
.psr-resources-title span {
    color: #9b6cff;
    font-size: 14px;
}
.psr-resources-title strong {
    font-weight: 750;
}
.psr-resources-grid {
    display: grid;
    grid-template-columns:
        repeat(2, minmax(0, 1fr));
    gap: 10px;
}
.psr-resource {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
    padding: 12px 14px;
    border-radius: 9px;
    text-decoration: none;
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.065);
    overflow: hidden;
    transition:
        transform 0.2s ease,
        background 0.2s ease,
        border-color 0.2s ease,
        box-shadow 0.2s ease;
}
.psr-resource::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background:
        linear-gradient(
            90deg,
            #6d4aff,
            #9b6cff
        );
    opacity: .65;
}
.psr-resource:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.055);
    border-color: rgba(155, 108, 255, 0.28);
    box-shadow:
        0 6px 18px rgba(0, 0, 0, 0.13);
}
.psr-resource-name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
    font-weight: 750;
    color: #e6e6e6;
}
.psr-resource-type {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    flex-shrink: 0;
    margin-left: 10px;
    font-size: 10px;
    font-weight: 600;
    color: #8d8d8d;
    transition: color .2s ease;
}
.psr-resource-type::after {
    content: "";
    display: block;
    width: 13px;
    height: 13px;
    flex: 0 0 13px;
    background-color: currentColor;
    -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'%3E%3Cpath d='M384 32c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96C0 60.7 28.7 32 64 32l320 0zM168 160c-9.7 0-18.5 5.8-22.2 14.8s-1.7 19.3 5.2 26.2l35 35-67 67c-9.4 9.4-9.4 24.6 0 33.9l24 24c9.4 9.4 24.6 9.4 33.9 0l67-67 35 35c6.9 6.9 17.2 8.9 26.2 5.2S320 321.7 320 312l0-128c0-13.3-10.7-24-24-24l-128 0z'/%3E%3C/svg%3E");
    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'%3E%3Cpath d='M384 32c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96C0 60.7 28.7 32 64 32l320 0zM168 160c-9.7 0-18.5 5.8-22.2 14.8s-1.7 19.3 5.2 26.2l35 35-67 67c-9.4 9.4-9.4 24.6 0 33.9l24 24c9.4 9.4 24.6 9.4 33.9 0l67-67 35 35c6.9 6.9 17.2 8.9 26.2 5.2S320 321.7 320 312l0-128c0-13.3-10.7-24-24-24l-128 0z'/%3E%3C/svg%3E");
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-position: center;
    mask-position: center;
    -webkit-mask-size: contain;
    mask-size: contain;
    opacity: .85;
    transition:
        transform .2s ease,
        opacity .2s ease;
}
.psr-resource:hover .psr-resource-type::after {
    opacity: 1;
    transform: translateX(2px);
}
.psr-resource:hover .psr-resource-type {
    color: #a98aff;
}
.psr-footer {
    position: relative;
    margin-top: 35px;
    padding: 35px 10px 18px;
    text-align: center;
    border-top: 1px solid var(--psr-border);
}
.psr-footer::before {
    content: "";
    display: block;
    width: 125px;
    height: 3px;
    margin: -37px auto 25px;
    border-radius: 999px;
    background:
        linear-gradient(
            90deg,
            var(--psr-blue, #4b8cff),
            var(--psr-cyan, #47dfff),
            var(--psr-pink, #e22b74),
            var(--psr-purple, #9b5cff)
        );
}
.psr-footer-title {
    margin: 0 0 8px;
    color: #fff;
    font-size: 15px;
    font-weight: 900;
}
.psr-footer-description {
    margin: 0 auto 8px !important;
    max-width: 600px;
    color: rgba(245,248,255,.72);
    font-size: 12px;
    line-height: 1.6;
}
.psr-footer-message {
    margin: 0 auto !important;
    max-width: 650px;
    color: rgba(245,248,255,.5);
    font-size: 11px;
    line-height: 1.6;
}
.psr-footer-contact {
    position: relative;
    isolation: isolate;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    margin-top: 18px;
    padding: 10px 18px;
    border: 1px solid rgba(255,255,255,.14);
    border-radius: 9px;
    background: rgba(255,255,255,.055);
    color: rgba(245,248,255,.92) !important;
    text-decoration: none;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 3px 12px rgba(0,0,0,.14);
    transition:
        background .2s ease,
        border-color .2s ease,
        box-shadow .25s ease,
        transform .2s ease;
}
.psr-footer-contact::before,
.psr-footer-contact::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    pointer-events: none;
    opacity: 0;
    z-index: -1;
}
.psr-footer-contact::before {
    box-shadow:
        -42px -18px 0 #ff4d6d,
         38px -22px 0 #ff9f43,
        -58px  10px 0 #ffe66d,
         55px   8px 0 #55efc4,
        -35px  28px 0 #54a0ff,
         35px  30px 0 #a66cff;
    transform: scale(.15);
    transition: none;
}
.psr-footer-contact::after {
    box-shadow:
        -25px -32px 0 #ff6bcb,
         25px -35px 0 #ff4d6d,
        -68px  -2px 0 #54a0ff,
         68px  -5px 0 #55efc4,
        -25px  35px 0 #ffe66d,
         28px  38px 0 #a66cff;
    transform: scale(.15);
}
.psr-footer-contact:hover::before {
    animation: psrSparkleBurst .65s ease-out forwards;
}
.psr-footer-contact:hover::after {
    animation: psrSparkleBurst .75s .04s ease-out forwards;
}
@keyframes psrSparkleBurst {
    0% {
        opacity: 0;
        transform: scale(.15);
    }
    15% {
        opacity: 1;
    }
    65% {
        opacity: .85;
        transform: scale(.8);
    }
    100% {
        opacity: 0;
        transform: scale(1.15);
    }
}
.psr-footer-contact:hover {
    background: rgba(110,145,255,.16);
    border-color: rgba(140,130,255,.38);
    box-shadow:
        0 4px 16px rgba(100,90,255,.15),
        0 0 15px rgba(180,100,255,.08);
    transform: translateY(-1px);
}
.psr-footer-contact:active {
    transform: translateY(0) scale(.97);
}
@media (prefers-reduced-motion: reduce) {
    .psr-footer-contact::before,
    .psr-footer-contact::after {
        animation: none !important;
    }
    .psr-footer-contact:hover {
        transform: none;
    }
}
.psr-footer-ending {
    margin: 18px 0 0;
    color: rgba(245,248,255,.4);
    font-size: 10px;
    line-height: 1.5;
}
.psr-footer-ending span{
    margin: 0 6px;
}
@media (prefers-reduced-motion: reduce) {
    .psr-footer-contact {
        transition: none;
    }
    .psr-footer-contact:hover,
    .psr-footer-contact:active {
        transform: none;
    }
}
.psr-footer-info {
    display: inline-flex;
    flex-direction: column;
    min-width: 290px;
    margin-top: 16px;
    padding: 7px 14px;
    border: 1px solid rgba(255,255,255,.10);
    border-radius: 9px;
    background: rgba(255,255,255,.035);
}

.psr-footer-info-row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 29px;
    font-size: 11px;
    color: rgba(245,248,255,.55);
    text-align: left;
}

.psr-footer-info-row strong {
    margin-left: auto;
    color: rgba(245,248,255,.9);
    font-size: 12px;
    font-weight: 800;
}

.psr-footer-info-divider {
    height: 1px;
    margin: 2px 0;
    background: rgba(255,255,255,.07);
}
.psr-bulletin {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 22px;
    margin-top: 24px;
}
.psr-bulletin-column {
    overflow: hidden;
    border: 1px solid rgba(128, 128, 128, 0.18);
    border-radius: 16px;
    background: rgba(128, 128, 128, 0.055);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}
.psr-bulletin-header {
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 18px 20px;
    border-bottom: 1px solid rgba(128, 128, 128, 0.15);
}
.psr-bulletin-header.current {
    background: rgba(80, 180, 110, 0.08);
}
.psr-bulletin-header.upcoming {
    background: rgba(80, 130, 255, 0.08);
}
.psr-bulletin-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    flex: 0 0 42px;
    border-radius: 12px;
    background: rgba(128, 128, 128, 0.1);
    font-size: 21px;
}
.psr-bulletin-header h3 {
    margin: 0;
    font-size: 18px;
}
.psr-bulletin-status {
    display: block;
    margin-top: 3px;
    font-size: 12px;
    opacity: 0.65;
}
.psr-bulletin-list {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 5px 0;
    list-style: none;
}
.psr-bulletin-list li {
    display: flex;
    gap: 12px;
    padding: 14px 20px;
    border-bottom: 1px solid rgba(128, 128, 128, 0.1);
}
.psr-bulletin-list li:last-child {
    border-bottom: 0;
}
.psr-bulletin-list li > span {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    width: 22px;
    flex: 0 0 22px;
    padding-top: 1px;
    font-size: 15px;
    font-weight: 700;
}
.psr-bulletin-header.current
+ .psr-bulletin-list li > span {
    color: #4caf70;
}
.psr-bulletin-header.upcoming
+ .psr-bulletin-list li > span {
    color: #5d8cff;
}
.psr-bulletin-list strong {
    display: block;
    margin-bottom: 3px;
    font-size: 14px;
}
.psr-bulletin-list p {
    margin: 0;
    font-size: 13px;
    line-height: 1.55;
    opacity: 0.72;
}
.psr-bulletin {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 22px;
    margin-top: 24px;
}
.psr-bulletin-column {
    overflow: hidden;
    border: 1px solid rgba(128, 128, 128, 0.18);
    border-radius: 16px;
    background: rgba(128, 128, 128, 0.055);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}
.psr-bulletin-list {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 5px 0;
    list-style: none;
}
.psr-bulletin-list li {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 20px;
    border-bottom: 1px solid rgba(128, 128, 128, 0.1);
}
.psr-bulletin-list li:last-child {
    border-bottom: 0;
}
.psr-bulletin-mark {
    display: block;
    width: 15px;
    height: 17px;
    flex: 0 0 15px;
    margin-top: 2px;
    background: currentColor;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-position: center;
    mask-position: center;
    -webkit-mask-size: contain;
    mask-size: contain;
}
.psr-bulletin-column:first-child .psr-bulletin-mark {
    color: #4caf70;
    -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'%3E%3Cpath d='M320 0c17.7 0 32 14.3 32 32l0 32 32 0c35.3 0 64 28.7 64 64l0 288c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 128C0 92.7 28.7 64 64 64l32 0 0-32c0-17.7 14.3-32 32-32s32 14.3 32 32l0 32 128 0 0-32c0-17.7 14.3-32 32-32zm22 161.7c-10.7-7.8-25.7-5.4-33.5 5.3L189.1 331.2 137 279.1c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l72 72c5 5 11.9 7.5 18.8 7s13.4-4.1 17.5-9.8L347.3 195.2c7.8-10.7 5.4-25.7-5.3-33.5z'/%3E%3C/svg%3E");
    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'%3E%3Cpath d='M320 0c17.7 0 32 14.3 32 32l0 32 32 0c35.3 0 64 28.7 64 64l0 288c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 128C0 92.7 28.7 64 64 64l32 0 0-32c0-17.7 14.3-32 32-32s32 14.3 32 32l0 32 128 0 0-32c0-17.7 14.3-32 32-32zm22 161.7c-10.7-7.8-25.7-5.4-33.5 5.3L189.1 331.2 137 279.1c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l72 72c5 5 11.9 7.5 18.8 7s13.4-4.1 17.5-9.8L347.3 195.2c7.8-10.7 5.4-25.7-5.3-33.5z'/%3E%3C/svg%3E");
}
.psr-bulletin-column:last-child .psr-bulletin-mark {
    width: 16px;
    height: 14px;
    margin-top: 3px;
    color: #5d8cff;
    -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 576 512'%3E%3Cpath d='M566.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-128 128c-9.2 9.2-22.9 11.9-34.9 6.9S384 396.9 384 384l0-64-336 0c-26.5 0-48-21.5-48-48l0-32c0-26.5 21.5-48 48-48l336 0 0-64c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l128 128z'/%3E%3C/svg%3E");
    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 576 512'%3E%3Cpath d='M566.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-128 128c-9.2 9.2-22.9 11.9-34.9 6.9S384 396.9 384 384l0-64-336 0c-26.5 0-48-21.5-48-48l0-32c0-26.5 21.5-48 48-48l336 0 0-64c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l128 128z'/%3E%3C/svg%3E");
}
#psr-table-of-contents {
    margin: 30px 0 38px;
    padding: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.025);
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.035);
}
#psr-table-of-contents {
    position: relative !important;
    display: block !important;
    width: auto !important;
    margin: 34px 0 40px !important;
    padding: 18px !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 16px !important;
    background: linear-gradient(
        135deg,
        rgba(18, 27, 37, 0.86),
        rgba(10, 16, 23, 0.78)
    ) !important;
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.22),
        inset 0 1px 0 rgba(255, 255, 255, 0.055) !important;
    backdrop-filter: blur(14px) !important;
    -webkit-backdrop-filter: blur(14px) !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
}
#psr-table-of-contents::before {
    content: "" !important;
    position: absolute !important;
    top: -100px !important;
    right: -80px !important;
    width: 300px !important;
    height: 220px !important;
    border-radius: 50% !important;
    background: rgba(75, 145, 235, 0.08) !important;
    filter: blur(65px) !important;
    pointer-events: none !important;
}
#psr-table-of-contents::after {
    content: "" !important;
    position: absolute !important;
    bottom: -120px !important;
    left: 10% !important;
    width: 300px !important;
    height: 190px !important;
    border-radius: 50% !important;
    background: rgba(145, 90, 220, 0.055) !important;
    filter: blur(70px) !important;
    pointer-events: none !important;
}
#psr-table-of-contents .psr-toc-header {
    position: relative !important;
    z-index: 2 !important;
    display: block !important;
    margin: 2px 4px 17px !important;
    padding: 0 !important;
    border: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
}
#psr-table-of-contents .psr-toc-header h2 {
    display: block !important;
    margin: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    background: transparent !important;
    color: rgba(248, 250, 255, 0.97) !important;
    font-size: 20px !important;
    font-weight: 850 !important;
    font-family: inherit !important;
    line-height: 1.3 !important;
    letter-spacing: -0.025em !important;
    text-shadow: 0 1px 10px rgba(0, 0, 0, 0.18) !important;
}
#psr-table-of-contents .psr-toc-header p {
    display: block !important;
    margin: 6px 0 0 !important;
    padding: 0 !important;
    border: 0 !important;
    background: transparent !important;
    color: rgba(205, 214, 232, 0.58) !important;
    font-size: 11px !important;
    font-weight: 500 !important;
    font-family: inherit !important;
    line-height: 1.5 !important;
}
#psr-table-of-contents .psr-toc-grid {
    position: relative !important;
    z-index: 2 !important;
    display: grid !important;
    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
    gap: 8px !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
}
#psr-table-of-contents .psr-toc-grid .psr-toc-link,
#psr-table-of-contents .psr-toc-grid .psr-toc-link:hover,
#psr-table-of-contents .psr-toc-grid .psr-toc-link:active,
#psr-table-of-contents .psr-toc-grid .psr-toc-link:visited {
    position: relative !important;
    display: flex !important;
    align-items: center !important;
    width: auto !important;
    min-width: 0 !important;
    height: 38px !important;
    margin: 0 !important;
    padding: 0 10px !important;
    gap: 9px !important;
    box-sizing: border-box !important;
    border: 1px solid rgba(92, 155, 220, 0.22) !important;
    border-radius: 9px !important;
    background: linear-gradient(
        135deg,
        rgba(76, 145, 215, 0.075),
        rgba(255, 255, 255, 0.018)
    ) !important;
    color: rgba(220, 229, 242, 0.84) !important;
    font-family: inherit !important;
    font-size: 11px !important;
    font-weight: 750 !important;
    line-height: 1.25 !important;
    text-decoration: none !important;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025),
        0 3px 10px rgba(0, 0, 0, 0.08) !important;
    transform: none !important;
    transition: background 0.2s ease, border-color 0.2s ease,
        box-shadow 0.2s ease, color 0.2s ease !important;
}
#psr-table-of-contents .psr-toc-grid .psr-toc-link:hover,
#psr-table-of-contents .psr-toc-grid .psr-toc-link:focus-visible {
    color: #ffffff !important;
    border-color: rgba(91, 166, 235, 0.58) !important;
    background: linear-gradient(
        135deg,
        rgba(70, 145, 225, 0.18),
        rgba(70, 145, 225, 0.055)
    ) !important;
    box-shadow: 0 7px 20px rgba(0, 0, 0, 0.15),
        0 0 18px rgba(70, 145, 225, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.06) !important;
    transform: translateY(-1px) !important;
}
#psr-table-of-contents .psr-toc-grid .psr-toc-link.psr-toc-active {
    color: #ffffff !important;
    border-color: rgba(91, 166, 235, 0.6) !important;
    background: linear-gradient(
        135deg,
        rgba(70, 145, 225, 0.2),
        rgba(70, 145, 225, 0.065)
    ) !important;
    box-shadow: 0 0 20px rgba(70, 145, 225, 0.11),
        inset 0 1px 0 rgba(255, 255, 255, 0.06) !important;
}
#psr-table-of-contents .psr-toc-grid .psr-toc-link::before {
    content: "" !important;
    position: absolute !important;
    left: 0 !important;
    top: 8px !important;
    bottom: 8px !important;
    width: 2px !important;
    margin: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    border-radius: 2px !important;
    background: rgb(82, 157, 225) !important;
    opacity: 0.48 !important;
    box-shadow: 0 0 8px rgba(82, 157, 225, 0.3) !important;
    transition: width 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease !important;
}
#psr-table-of-contents .psr-toc-grid .psr-toc-link:hover::before,
#psr-table-of-contents .psr-toc-grid .psr-toc-link.psr-toc-active::before {
    width: 3px !important;
    opacity: 1 !important;
    box-shadow: 0 0 11px rgba(82, 157, 225, 0.7) !important;
}
#psr-table-of-contents .psr-toc-grid .psr-toc-number {
    display: block !important;
    flex: 0 0 auto !important;
    min-width: 20px !important;
    width: 20px !important;
    margin: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    background: transparent !important;
    color: rgba(105, 174, 232, 0.72) !important;
    font-family: inherit !important;
    font-size: 9px !important;
    font-weight: 850 !important;
    line-height: 1 !important;
    letter-spacing: 0.04em !important;
    text-align: left !important;
    transition: color 0.2s ease, text-shadow 0.2s ease !important;
}
#psr-table-of-contents .psr-toc-grid .psr-toc-link:hover .psr-toc-number,
#psr-table-of-contents
    .psr-toc-grid
    .psr-toc-link.psr-toc-active
    .psr-toc-number {
    color: rgb(105, 185, 245) !important;
    text-shadow: 0 0 8px rgba(90, 175, 240, 0.4) !important;
}
#psr-table-of-contents .psr-toc-grid .psr-toc-label {
    display: block !important;
    flex: 1 1 auto !important;
    min-width: 0 !important;
    width: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    background: transparent !important;
    color: inherit !important;
    font-family: inherit !important;
    font-size: 11px !important;
    font-weight: 750 !important;
    line-height: 1.25 !important;
    letter-spacing: 0.005em !important;
    text-align: left !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
}
#psr-table-of-contents .psr-toc-grid .psr-toc-arrow {
    display: block !important;
    flex: 0 0 auto !important;
    width: 17px !important;
    min-width: 17px !important;
    max-width: 17px !important;
    height: 17px !important;
    min-height: 17px !important;
    max-height: 17px !important;
    margin: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    background: transparent !important;
    fill: rgb(82, 157, 225) !important;
    color: rgb(82, 157, 225) !important;
    opacity: 0.72 !important;
    transform: none !important;
    filter: drop-shadow(0 0 4px rgba(82, 157, 225, 0.18)) !important;
    transition: opacity 0.2s ease, transform 0.2s ease, filter 0.2s ease !important;
}
#psr-table-of-contents .psr-toc-grid .psr-toc-link:hover .psr-toc-arrow,
#psr-table-of-contents
    .psr-toc-grid
    .psr-toc-link.psr-toc-active
    .psr-toc-arrow {
    fill: rgb(105, 185, 245) !important;
    color: rgb(105, 185, 245) !important;
    opacity: 1 !important;
    transform: translateX(3px) !important;
    filter: drop-shadow(0 0 7px rgba(90, 175, 240, 0.58)) !important;
}
#psr-table-of-contents a,
#psr-table-of-contents a:hover,
#psr-table-of-contents a:active,
#psr-table-of-contents a:visited {
    text-decoration: none !important;
    outline: none !important;
}
#about,
#what-new,
#installation,
#features,
#patch-logs,
#feedback,
#credits,
#contact {
    scroll-margin-top: 24px !important;
}
.psr-carousel {
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
}
.psr-carousel-main {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
}
.psr-carousel-viewport {
    flex: 1;
    min-width: 0;
    width: 100%;
    height: 360px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 16px;
}
.psr-carousel-track {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
.psr-carousel-slide {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: none !important;
    border-radius: 0 !important;
    opacity: 0;
    visibility: hidden;
    transform: scale(0.98);
    transition: opacity 0.4s ease, transform 0.4s ease;
}
.psr-carousel-slide.active {
    opacity: 1;
    visibility: visible;
    transform: scale(1);
}
.psr-carousel-slide img {
    display: block;
    width: auto !important;
    height: auto !important;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    object-position: center;
    box-sizing: border-box;
    border-radius: 5px !important;
    overflow: hidden;
}
.psr-carousel-arrow {
    flex: 0 0 auto;
    width: 38px;
    height: 38px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.12);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease, transform 0.2s ease;
}
.psr-carousel-arrow:hover {
    background: rgba(0, 0, 0, 0.22);
}
.psr-carousel-arrow:active {
    transform: scale(0.92);
}
.psr-carousel-arrow svg {
    width: 21px;
    height: 21px;
    display: block;
    fill: currentColor;
    transition: transform 0.2s ease;
}
.psr-carousel-arrow:hover svg {
    transform: scale(1.25);
}
.psr-carousel-viewport {
    height: 360px;
}
.psr-carousel-dots {
    width: 100%;
    margin-top: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
}
.psr-carousel-dot {
    width: 8px;
    height: 8px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: rgba(128, 128, 128, 0.55);
    cursor: pointer;
    transition: width 0.25s ease, background 0.25s ease, transform 0.25s ease;
}
.psr-carousel-dot.active {
    width: 22px;
    border-radius: 10px;
    background: currentColor;
}
.psr-carousel-dot:hover {
    transform: scale(1.15);
}
@media (prefers-reduced-motion: reduce) {
    #psr-table-of-contents .psr-toc-link,
    #psr-table-of-contents .psr-toc-number,
    #psr-table-of-contents .psr-toc-arrow,
    #psr-table-of-contents .psr-toc-link::before {
        transition: none !important;
    }
    #psr-table-of-contents .psr-toc-link:hover {
        transform: none !important;
    }
}
.psr-community-thanks {
    position: relative;
    margin-top: 18px;
    padding: 18px 20px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.07);
    overflow: hidden;
}
.psr-community-thanks::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background:
        linear-gradient(
            90deg,
            #E22B74,
            #9B5CFF,
            #578D35
        );
    opacity: .8;
}
.psr-community-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    font-size: 13px;
}
.psr-community-title span {
    color: #E22B74;
    font-size: 15px;
}
.psr-community-title strong {
    font-weight: 750;
}
.psr-community-intro {
    max-width: 650px;
    margin: 7px auto 15px !important;
    font-size: 11px;
    line-height: 1.55;
    color: #8d8d8d;
}
.psr-community-grid {
    display: grid;
    grid-template-columns:
        repeat(3, minmax(0, 1fr));
    gap: 9px;
}
.psr-community-person {
    padding: 11px 10px;
    text-align: center;
    border-radius: 9px;
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.055);
    transition:
        transform .2s ease,
        background .2s ease,
        border-color .2s ease;
}
.psr-community-person:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.05);
    border-color:
        rgba(155, 108, 255, .25);
}
.psr-community-name {
    display: block;
    margin-bottom: 3px;
    font-size: 12px;
    font-weight: 750;
    color: #dedede;
}
.psr-community-role {
    display: block;
    font-size: 9.5px;
    font-weight: 600;
    color: #777;
}
.psr-community-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 13px;
    font-size: 10px;
    color: #777;
}
.psr-community-footer span {
    color: #9B6CFF;
    font-size: 11px;
}
.psr-welcome-overlay {
    position: fixed !important;
    inset: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    margin: 0 !important;
    padding: 18px !important;
    box-sizing: border-box !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    z-index: 2147483647 !important;
    background:
        linear-gradient(
            120deg,
            #050816,
            #080b20,
            #06151c,
            #10071c,
            #050816
        ) !important;
    overflow: hidden !important;
    backdrop-filter: blur(9px);
    -webkit-backdrop-filter: blur(9px);
}
.psr-welcome-overlay::before,
.psr-welcome-overlay::after {
    content: "" !important;
    position: absolute !important;
    width: 500px !important;
    height: 500px !important;
    border-radius: 50% !important;
    pointer-events: none !important;
    filter: blur(70px) !important;
    opacity: .55 !important;
    z-index: -1 !important;
}
.psr-welcome-overlay::before {
    background:
        radial-gradient(
            circle,
            rgba(96, 165, 250, .75) 0%,
            rgba(34, 211, 238, .45) 30%,
            rgba(167, 139, 250, .25) 55%,
            transparent 72%
        ) !important;
    top: -180px !important;
    left: -180px !important;
    animation:
        psr-orb-one 12s ease-in-out infinite alternate !important;
}
.psr-welcome-overlay::after {
    background:
        radial-gradient(
            circle,
            rgba(244, 114, 182, .65) 0%,
            rgba(167, 139, 250, .45) 35%,
            rgba(52, 211, 153, .25) 60%,
            transparent 75%
        ) !important;
    right: -180px !important;
    bottom: -180px !important;
    animation:
        psr-orb-two 15s ease-in-out infinite alternate !important;
}
.psr-welcome-overlay {
    isolation: isolate !important;
}
.psr-welcome-overlay .psr-welcome-popup {
    position: relative !important;
    z-index: 2 !important;
}
@keyframes psr-orb-one {
    0% {
        transform:
            translate3d(0, 0, 0)
            scale(1);
    }
    25% {
        transform:
            translate3d(35vw, 8vh, 0)
            scale(1.15);
    }
    50% {
        transform:
            translate3d(55vw, 45vh, 0)
            scale(.9);
    }
    75% {
        transform:
            translate3d(20vw, 65vh, 0)
            scale(1.2);
    }
    100% {
        transform:
            translate3d(-5vw, 35vh, 0)
            scale(1);
    }
}
@keyframes psr-orb-two {
    0% {
        transform:
            translate3d(0, 0, 0)
            scale(1);
    }
    25% {
        transform:
            translate3d(-30vw, -10vh, 0)
            scale(1.2);
    }
    50% {
        transform:
            translate3d(-55vw, -35vh, 0)
            scale(.85);
    }
    75% {
        transform:
            translate3d(-25vw, -60vh, 0)
            scale(1.15);
    }
    100% {
        transform:
            translate3d(5vw, -25vh, 0)
            scale(1);
    }
}
.psr-welcome-popup {
    position: relative !important;
    width: min(640px, calc(100vw - 36px)) !important;
    height: 700px !important;
    max-width: calc(100vw - 36px) !important;
    max-height: calc(100vh - 36px) !important;
    min-width: 0 !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
    border: 1px solid rgba(255,255,255,.12) !important;
    border-radius: 18px !important;
    background:
        linear-gradient(
            145deg,
            #1d2036,
            #111322
        ) !important;
    box-shadow:
        0 24px 70px rgba(0,0,0,.55) !important;
}
.psr-welcome-scroll {
    width: 100% !important;
    height: 100% !important;
    min-width: 0 !important;
    margin: 0 !important;
    padding: 27px 32px 25px !important;
    box-sizing: border-box !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
    scrollbar-width: thin;
    scrollbar-color:
        rgba(130,145,220,.28)
        transparent;
}
.psr-welcome-scroll::-webkit-scrollbar {
    width: 5px;
}
.psr-welcome-scroll::-webkit-scrollbar-track {
    background: transparent;
}
.psr-welcome-scroll::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: rgba(130,145,220,.28);
}
.psr-welcome-logo {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100% !important;
    margin: 0 0 13px !important;
    padding: 0 !important;
}
.psr-welcome-logo .logo {
    display: block !important;
    width: 146px !important;
    height: 44px !important;
    max-width: 146px !important;
    margin: 0 !important;
    object-fit: contain !important;
}
.psr-welcome-hero {
    width: 100% !important;
    margin: 0 0 40px !important;
    padding: 0 !important;
    text-align: center !important;
}
.psr-welcome-tag {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    margin: 0 0 9px !important;
    padding: 4px 11px !important;
    border:
        1px solid rgba(125,145,255,.22) !important;
    border-radius: 999px !important;
    background:
        rgba(100,110,220,.08) !important;
    color:
        rgba(175,180,255,.72) !important;
    font-size: 8px !important;
    font-weight: 900 !important;
    letter-spacing: 1px !important;
    line-height: 1.2 !important;
}
.psr-welcome-hero p {
    max-width: 500px !important;
    margin: 0 auto !important;
    padding: 0 !important;
    color:
        rgba(245,248,255,.58) !important;
    font-size: 11px !important;
    line-height: 1.7 !important;
    text-align: center !important;
}
@keyframes psr-welcome-gradient {
    0% {
        background-position: 0% 50%;
    }
    100% {
        background-position: 200% 50%;
    }
}
.psr-welcome-warning {
    width: 100% !important;
    margin: 0 0 42px !important;
    padding: 0 17px 17px !important;
    box-sizing: border-box !important;
    border:
        2px solid rgba(255,82,82,.25) !important;
    border-radius: 14px !important;
    background:
        rgba(255,65,65,.035) !important;
    box-shadow: none !important;
}
.psr-warning-divider {
    display: flex !important;
    align-items: center !important;
    width: 100% !important;
    height: 60px !important;
    margin: -30px 0 18px !important;
    padding: 0 !important;
    box-sizing: border-box !important;
}
.psr-warning-line {
    flex: 1 !important;
    width: auto !important;
    height: 2px !important;
    margin: 0 !important;
    padding: 0 !important;
    background:
        rgba(255,92,92,.30) !important;
    box-shadow: none !important;
}
.psr-warning-line:first-child {
    background:
        linear-gradient(
            90deg,
            transparent,
            rgba(255,92,92,.30)
        ) !important;
}
.psr-warning-line:last-child {
    background:
        linear-gradient(
            90deg,
            rgba(255,92,92,.30),
            transparent
        ) !important;
}
.psr-warning-circle {
    position: relative !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 54px !important;
    height: 54px !important;
    min-width: 54px !important;
    min-height: 54px !important;
    flex: 0 0 54px !important;
    margin: 0 10px !important;
    padding: 0 !important;
    box-sizing: border-box !important;
    border:
        3px solid #292330 !important;
    border-radius: 50% !important;
    background:
        #ff7568 !important;
    box-shadow:
        0 0 0 2px rgba(255,92,92,.38) !important;
}
.psr-warning-triangle {
    display: none !important;
}
.psr-warning-circle::before {
    content: "!" !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100% !important;
    height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    color:
        #292330 !important;
    font-family:
        Arial,
        Helvetica,
        sans-serif !important;
    font-size: 36px !important;
    font-weight: 900 !important;
    line-height: 1 !important;
    transform:
        translateY(-1px) !important;
}
.psr-warning-circle::after {
    display: none !important;
}
.psr-welcome-warning > h3 {
    margin: 0 0 6px !important;
    padding: 0 !important;
    color:
        #ffad98 !important;
    font-size: 16px !important;
    font-weight: 900 !important;
    line-height: 1.3 !important;
    text-align: center !important;
}
.psr-warning-intro {
    margin: 0 0 14px !important;
    padding: 0 !important;
    color:
        rgba(255,220,215,.53) !important;
    font-size: 10px !important;
    line-height: 1.5 !important;
    text-align: center !important;
}
.psr-warning-items {
    display: flex !important;
    flex-direction: column !important;
    gap: 6px !important;
    width: 100% !important;
}
.psr-warning-item {
    width: 100% !important;
    box-sizing: border-box !important;
    padding: 9px 10px !important;
    border:
        1px solid rgba(255,100,100,.055) !important;
    border-radius: 8px !important;
    background:
        rgba(255,80,80,.025) !important;
}
.psr-warning-item strong {
    display: block !important;
    margin: 0 0 3px !important;
    padding: 0 !important;
    color:
        rgba(255,225,220,.88) !important;
    font-size: 10px !important;
    font-weight: 800 !important;
    line-height: 1.3 !important;
}
.psr-warning-item span {
    display: block !important;
    margin: 0 !important;
    padding: 0 !important;
    color:
        rgba(255,225,220,.50) !important;
    font-size: 9px !important;
    line-height: 1.55 !important;
}
.psr-warning-note {
    display: flex !important;
    align-items: flex-start !important;
    gap: 7px !important;
    width: 100% !important;
    box-sizing: border-box !important;
    margin: 10px 0 0 !important;
    padding: 9px 10px !important;
    border:
        1px solid rgba(255,100,70,.08) !important;
    border-radius: 8px !important;
    background:
        rgba(255,90,70,.055) !important;
    color:
        rgba(255,205,195,.58) !important;
    font-size: 9px !important;
    line-height: 1.5 !important;
}
.psr-warning-note-icon {
    flex: 0 0 auto !important;
    color:
        #ff927a !important;
}
.psr-welcome-section {
    position: relative !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 0 24px !important;
    border: 0 !important;
    text-align: left !important;
}
.psr-welcome-section + .psr-welcome-section {
    padding-top: 24px !important;
    border-top:
        1px solid rgba(255,255,255,.075) !important;
}
.psr-welcome-section h3 {
    display: flex !important;
    align-items: center !important;
    min-height: 18px !important;
    margin: 0 0 11px !important;
    padding: 0 0 0 11px !important;
    border: 0 !important;
    border-left:
        3px solid #9a6cff !important;
    color:
        rgba(255,255,255,.94) !important;
    font-size: 14px !important;
    font-weight: 900 !important;
    line-height: 1.3 !important;
}
.psr-welcome-section h3::after {
    content: "" !important;
    width: 35px !important;
    height: 1px !important;
    margin-left: 10px !important;
    background:
        linear-gradient(
            90deg,
            rgba(154,108,255,.45),
            transparent
        ) !important;
}
.psr-welcome-section p {
    width: 100% !important;
    margin: 0 0 11px !important;
    padding: 0 !important;
    color:
        rgba(245,248,255,.56) !important;
    font-size: 11px !important;
    line-height: 1.75 !important;
    text-align: left !important;
}
.psr-welcome-section p:last-child {
    margin-bottom: 0 !important;
}
.psr-welcome-section strong {
    color:
        rgba(245,248,255,.87) !important;
    font-weight: 800 !important;
}
.psr-welcome-consent {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100% !important;
    margin: 8px 0 0 !important;
    padding: 0 !important;
    border: 0 !important;
}
.psr-welcome-check {
    position: relative !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 9px !important;
    margin: 0 !important;
    padding: 0 !important;
    cursor: pointer !important;
    user-select: none !important;
}
.psr-welcome-checkbox {
    position: absolute !important;
    width: 18px !important;
    height: 18px !important;
    margin: 0 !important;
    padding: 0 !important;
    opacity: 0 !important;
    cursor: pointer !important;
}
.psr-welcome-checkmark {
    position: relative !important;
    display: block !important;
    width: 17px !important;
    height: 17px !important;
    min-width: 17px !important;
    flex: 0 0 17px !important;
    box-sizing: border-box !important;
    border:
        1.5px solid rgba(255,255,255,.30) !important;
    border-radius: 4px !important;
    background:
        rgba(255,255,255,.035) !important;
    transition:
        .18s ease !important;
}
.psr-welcome-checkmark::after {
    content: "" !important;
    position: absolute !important;
    left: 5px !important;
    top: 2px !important;
    width: 4px !important;
    height: 8px !important;
    border:
        solid #fff !important;
    border-width:
        0 2px 2px 0 !important;
    transform:
        rotate(45deg) scale(0) !important;
    opacity: 0 !important;
    transition:
        .15s ease !important;
}
.psr-welcome-checkbox:checked
+ .psr-welcome-checkmark {
    border-color:
        #8098ff !important;
    background:
        linear-gradient(
            135deg,
            #638fff,
            #985cff
        ) !important;
}
.psr-welcome-checkbox:checked
+ .psr-welcome-checkmark::after {
    opacity: 1 !important;
    transform:
        rotate(45deg) scale(1) !important;
}
.psr-welcome-check-text {
    color:
        rgba(245,248,255,.61) !important;
    font-size: 11px !important;
    font-weight: 600 !important;
    line-height: 1.4 !important;
    white-space: nowrap !important;
}
.psr-welcome-checkbox:checked
~ .psr-welcome-check-text {
    color:
        rgba(245,248,255,.90) !important;
}
.psr-welcome-start.psr-footer-contact {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
    width: 150px !important;
    height: 43px !important;
    margin: 14px auto 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
    border:
        1px solid rgba(255,255,255,.12) !important;
    border-radius: 10px !important;
    background:
        rgba(255,255,255,.04) !important;
    color:
        rgba(255,255,255,.28) !important;
    text-decoration: none !important;
    font-size: 13px !important;
    font-weight: 850 !important;
    line-height: 1 !important;
    opacity: .62 !important;
    pointer-events: none !important;
    cursor: not-allowed !important;
    box-shadow: none !important;
    transition:
        background .2s ease,
        border-color .2s ease,
        color .2s ease,
        opacity .2s ease,
        transform .2s ease,
        box-shadow .2s ease !important;
}
.psr-welcome-start.psr-footer-contact.psr-welcome-ready {
    opacity: 1 !important;
    pointer-events: auto !important;
    cursor: pointer !important;
    color:
        rgba(255,255,255,.95) !important;
    border-color:
        rgba(130,150,255,.34) !important;
    background:
        linear-gradient(
            135deg,
            rgba(90,130,255,.22),
            rgba(150,80,255,.22)
        ) !important;
    box-shadow:
        0 5px 18px rgba(70,80,200,.14) !important;
}
.psr-welcome-start.psr-footer-contact.psr-welcome-ready:hover {
    transform:
        translateY(-2px) !important;
    border-color:
        rgba(150,165,255,.48) !important;
    background:
        linear-gradient(
            135deg,
            rgba(100,145,255,.32),
            rgba(170,90,255,.30)
        ) !important;
    color: #fff !important;
    box-shadow:
        0 8px 22px rgba(80,80,220,.18) !important;
}
.psr-welcome-start.psr-footer-contact.psr-welcome-ready:active {
    transform:
        scale(.97) !important;
}
.psr-welcome-start-icon {
    display: block !important;
    width: 16px !important;
    height: 18px !important;
    min-width: 16px !important;
    flex: 0 0 16px !important;
    margin: 0 !important;
    padding: 0 !important;
    fill:
        currentColor !important;
    stroke: none !important;
    overflow: visible !important;
    transition:
        transform .2s ease !important;
}
.psr-welcome-start.psr-footer-contact.psr-welcome-ready:hover,
.psr-welcome-start-icon {
    transform:
        translateX(3px) !important;
}
.psr-welcome-footer {
    width: 100% !important;
    margin: 11px 0 0 !important;
    padding: 0 !important;
    color:
        rgba(255,255,255,.29) !important;
    font-size: 10px !important;
    line-height: 1.5 !important;
    text-align: center !important;
}
@media (max-width: 600px) {
    .psr-welcome-overlay {
        padding: 10px !important;
    }
    .psr-welcome-popup {
        width:
            calc(100vw - 20px) !important;
        height:
            calc(100vh - 20px) !important;
        max-width:
            calc(100vw - 20px) !important;
        max-height:
            calc(100vh - 20px) !important;
        border-radius:
            16px !important;
    }
    .psr-welcome-scroll {
        padding:
            24px 18px 22px !important;
    }
    .psr-welcome-logo .logo {
        width:
            132px !important;
        height:
            auto !important;
    }
    .psr-welcome-hero h2 {
        font-size:
            20px !important;
    }
    .psr-welcome-hero p {
        font-size:
            10px !important;
    }
    .psr-warning-circle {
        width: 50px !important;
        height: 50px !important;
        min-width: 50px !important;
        min-height: 50px !important;
        flex-basis: 50px !important;
        margin:
            0 8px !important;
    }
    .psr-warning-circle::before {
        font-size:
            34px !important;
    }
    .psr-welcome-section h3 {
        font-size:
            13px !important;
    }
    .psr-welcome-section p {
        font-size:
            10px !important;
        line-height:
            1.7 !important;
    }
    .psr-welcome-check-text {
        font-size:
            10px !important;
    }
    .psr-welcome-warning {
        margin-bottom:
            34px !important;
    }
}
img[src*="ani/raichu-megax.gif"][style*="width: 90px"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Raichu-X.png") !important;
    display: block !important;
    transform: scale(1.3);
}
img[src*="ani/raichu-megay.gif"][style*="width: 89px"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Raichu-Y.png") !important;
    display: block !important;
    transform: scale(1.3);
}
img[src*="ani/golurk-mega.gif"][style*="width: 90px"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Golurk.png") !important;
    display: block !important;
    transform: scale(1.3);
}
img[src*="ani/chandelure-mega.gif"][style*="width: 90px"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Chandelure.png") !important;
    display: block !important;
    transform: scale(1.3);
}
img[src*="ani/chesnaught-mega.gif"][style*="width: 90px"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Chesnaught.png") !important;
    display: block !important;
    transform: scale(1.3);
}
img[src*="ani/delphox-mega.gif"][style*="width: 90px"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Delphox.png") !important;
    display: block !important;
    transform: scale(1.3);
}
img[src*="ani/greninja-mega.gif"][style*="width: 90px"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Greninja.png") !important;
    display: block !important;
    transform: scale(1.3);
}
img[src*="ani/pyroar-mega.gif"][style*="width: 90px"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Pyroar.png") !important;
    display: block !important;
    transform: scale(1.3);
}
img[src*="ani/floette-mega.gif"][style*="width: 90px"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Floette.png") !important;
    display: block !important;
    transform: scale(1.3);
}
img[src*="ani/meowstic-mmega.gif"][style*="width: 86px"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Meowstic.png") !important;
    display: block !important;
    transform: scale(1.3);
}
img[src*="ani/malamar-mega.gif"][style*="width: 90px"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Malamar.png") !important;
    display: block !important;
    transform: scale(1.3);
}
img[src*="ani/chimecho-mega.gif"][style*="width: 90px"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Chimecho.png") !important;
    display: block !important;
    transform: scale(1.3);
}
img[src*="ani/barbaracle-mega.gif"][style*="width: 90px"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Barbaracle.png") !important;
    display: block !important;
    transform: scale(1.3);
}
img[src*="ani/dragalge-mega.gif"][style*="width: 89px"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Dragalge.png") !important;
    display: block !important;
    transform: scale(1.3);
}
img[src*="ani/eelektross-mega.gif"][style*="width: 90px"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Eelektross.png") !important;
    display: block !important;
    transform: scale(1.3);
}
img[src*="ani/staraptor-mega.gif"][style*="width: 90px"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Staraptor.png") !important;
    display: block !important;
    transform: scale(1.3);
}
img[src*="ani/scolipede-mega.gif"][style*="width: 80px"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Scolipede.png") !important;
    display: block !important;
    transform: scale(1.3);
}
img[src*="ani/crabominable-mega.gif"][style*="width: 90px"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Crabominable.png") !important;
    display: block !important;
    transform: scale(1.3);
}
img[src*="ani/drampa-mega.gif"][style*="width: 90px"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Drampa.png") !important;
    display: block !important;
    transform: scale(1.3);
}
img[src*="ani/falinks-mega.gif"][style*="width: 90px"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Falinks.png") !important;
    display: block !important;
    transform: scale(1.3);
}
img[src*="ani/scovillain-mega.gif"][style*="width: 90px"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Scovillain.png") !important;
    display: block !important;
    transform: scale(1.3);
}
img[src*="ani/glimmora-mega.gif"][style*="width: 90px"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Glimmora.png") !important;
    display: block !important;
    transform: scale(1.3);
}
img[src*="ani/hawlucha-mega.gif"][style*="width: 90px"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Hawlucha.png") !important;
    display: block !important;
    transform: scale(1.3);
}
img[src*="ani/excadrill-mega.gif"][style*="width: 90px"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Excadrill.png") !important;
    display: block !important;
    transform: scale(1.3);
}
img[src*="ani/scrafty-mega.gif"][style*="width: 86px"] {
    content: url("https://raw.githubusercontent.com/AnujSharma2008/psr/refs/heads/main/assets/za-sprites/Mega-Scrafty.png") !important;
    display: block !important;
    transform: scale(1.3);
}
a[href="/resources"] span {
    font-size: 0px;
}
a[href="/resources"] span::before {
    content: "User Manual";
    font-size: 11px;
}
a[href="/resources"] i {
    font-size: 0 !important;
    width: 16px;
    height: 16px;
    display: inline-block;
    background-color: currentColor;
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath d='M116.7 33.8c4.5-6.1 11.7-9.8 19.3-9.8l240 0c7.6 0 14.8 3.6 19.3 9.8l112 152c6.8 9.2 6.1 21.9-1.5 30.4l-232 256c-4.5 5-11 7.9-17.8 7.9s-13.2-2.9-17.8-7.9l-232-256c-7.7-8.5-8.3-21.2-1.5-30.4l112-152zm38.5 39.8c-3.3 2.5-4.2 7-2.1 10.5L210.5 179.8 63.3 192c-4.1 .3-7.3 3.8-7.3 8s3.2 7.6 7.3 8l192 16c.4 0 .9 0 1.3 0l192-16c4.1-.3 7.3-3.8 7.3-8s-3.2-7.6-7.3-8l-147.2-12.3 57.4-95.6c2.1-3.5 1.2-8.1-2.1-10.5s-7.9-2-10.7 1L256 172.2 165.9 74.6c-2.8-3-7.4-3.4-10.7-1z'/%3E%3C/svg%3E")
        center / contain no-repeat;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath d='M116.7 33.8c4.5-6.1 11.7-9.8 19.3-9.8l240 0c7.6 0 14.8 3.6 19.3 9.8l112 152c6.8 9.2 6.1 21.9-1.5 30.4l-232 256c-4.5 5-11 7.9-17.8 7.9s-13.2-2.9-17.8-7.9l-232-256c-7.7-8.5-8.3-21.2-1.5-30.4l112-152zm38.5 39.8c-3.3 2.5-4.2 7-2.1 10.5L210.5 179.8 63.3 192c-4.1 .3-7.3 3.8-7.3 8s3.2 7.6 7.3 8l192 16c.4 0 .9 0 1.3 0l192-16c4.1-.3 7.3-3.8-7.3-8l-147.2-12.3 57.4-95.6c2.1-3.5 1.2-8.1-2.1-10.5s-7.9-2-10.7 1L256 172.2 165.9 74.6c-2.8-3-7.4-3.4-10.7-1z'/%3E%3C/svg%3E")
        center / contain no-repeat;
}

    `;
    GM_addStyle(myCss);
})();
