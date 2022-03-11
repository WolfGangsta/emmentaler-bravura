async function main() {
    let data = await fetch("./lily-to-smufl.json")
        .then(r => r.json());

    let lilyCodes = await fetch("./lily-name-to-charcode.json")
        .then(r => r.json());

    let glyphNames = await fetch("./smufl/glyphnames.json")
        .then(r => r.json());

    let bravuraMetadata = await fetch("./bravura/bravura_metadata.json")
        .then(r => r.json());

    let tablesDiv = document.getElementById("tables");
    let select = document.getElementById("selector");

    function bravCodeOf(bravName) {
        let code = 0;

        if (glyphNames[bravName]) {
            let str = glyphNames[bravName].codepoint;
            code = Number.parseInt(str.slice(2), 16);
        } else if (bravuraMetadata.optionalGlyphs[bravName]) {
            let str = bravuraMetadata.optionalGlyphs[bravName].codepoint;
            code = Number.parseInt(str.slice(2), 16);
        }

        return code;
    }

    for (let category of data) {
        let option = document.createElement("option");
        option.value = category.name;
        option.innerText = category.name + " glyphs";
        select.append(option);

        let categoryDiv = document.createElement("div");
        categoryDiv.value = category.name;

        let header = document.createElement("h2");
        header.innerText = category.name + " glyphs";
        categoryDiv.append(header);

        let table = document.createElement("table");

        let tr = document.createElement("tr");
        for (let header of ["LilyPond name", "Emmentaler glyph", "Bravura glyph", "Proposed SMuFL name"]) {
            let th = document.createElement("th");
            th.scope = "col";
            th.innerText = header;
            tr.append(th);
        }
        table.append(tr);

        for (let emmenName in category.glyphs) {
            let bravuraNames = category.glyphs[emmenName];
            if (typeof bravuraNames === "string" || !Array.isArray(bravuraNames)) {
                bravuraNames = [bravuraNames];
            }

            let row = document.createElement("tr");
            row.className = "first";

            let code = 0;
            if (lilyCodes[emmenName]) {
                code = lilyCodes[emmenName];
            }

            // Add first column (Lily name)
            let col1 = document.createElement("td");
            col1.className = "first lily-side glyph-name";
            if (code === 0) col1.className += " new";

            let emmenEntry = document.createElement("span");
            emmenEntry.className = "glyph-entry";
            emmenEntry.innerHTML = emmenName;
            col1.append(emmenEntry);

            // Second column (Emmentaler glyph)
            let col2 = document.createElement("td");
            col2.className = "first lily-side emmentaler glyph";
            if (code === 0) col2.className += " new";

            col2.innerHTML = String.fromCodePoint(code);

            col1.rowSpan = col2.rowSpan = bravuraNames.length;
            row.append(col1, col2);

            // Third & fourth columns
            for (let i = 0; i < bravuraNames.length; i++) {
                let bravName = bravuraNames[i];
                let status, altOf, ligOf, note, ref;
                if (typeof bravName === "object") {
                    status = bravName.status;
                    altOf = bravName.altOf;
                    ligOf = bravName.ligOf;
                    note = bravName.note;
                    ref = bravName.ref;

                    bravName = bravName.name;
                }

                if (glyphNames[bravName]) {
                    row.className = "smufl-recommended";
                } else if (bravuraMetadata.optionalGlyphs[bravName]) {
                    row.className = "optional-in-bravura";
                } else if (bravName) {
                    row.className = "new-to-smufl";
                } else {
                    row.className = "contentious";
                }

                // Third column (Bravura glyph)
                let cell3 = document.createElement("td");
                cell3.className = "glyph";
                if (i === 0) cell3.className += " first";

                let code = bravCodeOf(bravName);

                if (code) {
                    // Add an asterisk if the glyph is one of Bravura's "Additional Glyphs"
                    if (code >= 0xF400) {
                        cell3.append("* ");
                    }

                    let bravSpan = document.createElement("span");
                    bravSpan.className = "bravura";
                    bravSpan.innerHTML = String.fromCodePoint(code);
                    cell3.append(bravSpan);
                }

                // If the glyph is an alternate, print the base glyph
                if (altOf) {
                    cell3.append(" (alt. ");

                    code = bravCodeOf(altOf);

                    if (code) {
                        // Add an asterisk if the glyph is one of Bravura's "Additional Glyphs"
                        if (code >= 0xF400) {
                            cell3.append("* ");
                        }

                        let altSpan = document.createElement("span");
                        altSpan.className = "bravura";
                        altSpan.innerHTML = String.fromCodePoint(code);
                        cell3.append(altSpan);
                    } else {
                        cell3.append("*");
                    }
                    cell3.append(" )");
                }

                // If the glyph is a ligature, print the components
                if (ligOf) {
                    let ligSpans = document.createElement("span");
                    for (elem of ligOf) {
                        if (ligSpans.innerHTML) {
                            ligSpans.append(" + ");
                        } else {
                            ligSpans.append(" [ ");
                        }

                        code = bravCodeOf(elem);

                        if (code) {
                            // Add an asterisk if the glyph is one of Bravura's "Additional Glyphs"
                            if (code >= 0xF400) {
                                ligSpans.append("* ");
                            }

                            let ligSpan = document.createElement("span");
                            ligSpan.className = "bravura";
                            ligSpan.innerHTML = String.fromCodePoint(code);
                            ligSpans.append(ligSpan);
                        } else {
                            ligSpans.append("*");
                        }
                    }
                    ligSpans.append(" ]");
                    cell3.append(ligSpans);
                }

                    // Fourth column (SMuFL name)
                let cell4 = document.createElement("td");
                if (i === 0) cell4.className = "first";

                let bravEntry = document.createElement("span");
                bravEntry.className = "glyph-entry";
                bravInfoSpan = document.createElement("span");
                let bravNameSpan = document.createElement("span");
                bravNameSpan.className = "glyph-name";
                bravNameSpan.innerHTML = bravName;
                bravInfoSpan.append(bravNameSpan);
                bravEntry.append(bravInfoSpan);

                if (altOf) {
                    let altI = document.createElement("i");
                    let altSpan = document.createElement("span");
                    altSpan.className = "alt-or-lig-name";
                    altSpan.innerText = altOf;
                    altI.append(" (alt. of ", altSpan, ")");
                    bravEntry.append(altI);
                }
                if (ligOf) {
                    let ligI = document.createElement("i");
                    let ligSpan = document.createElement("span");
                    ligSpan.className = "alt-or-lig-name";
                    let list = ligOf.join(" + ")
                    ligSpan.innerText = list;
                    ligI.append(" (lig: ", ligSpan, ")");
                    bravEntry.append(ligI);
                }
                cell4.append(bravEntry);

                row.append(cell3, cell4);

                // Notes column
                if (note || ref) {
                    let noteCell = document.createElement("td");
                    noteCell.className = "note";
                    if (note) {
                        noteCell.innerHTML = note;
                    }
                    if (ref) {
                        if (noteCell.innerHTML !== "") {
                            noteCell.append(" ");
                        }
                        let refSpan = document.createElement("span");
                        refSpan.append("See");
                        if (!Array.isArray(ref)) {
                            ref = [ref];
                        }
                        for (let i in ref) {
                            let r = ref[i];
                            let threaded = false;
                            if (typeof r === "string") {
                                url = r;
                            } else {
                                url = r.url;
                                threaded = r.threaded;
                            }
                            let a = document.createElement("a");
                            a.innerHTML = "here";
                            a.href = url;
                            refSpan.append(" ");
                            if (ref.length > 1 && i == ref.length - 1) {
                                refSpan.append("and ");
                            }
                            refSpan.append(a);
                            if (threaded) {
                                refSpan.append(" (and the subsequent thread)")
                            }
                            if (ref.length > 2 && i < ref.length - 1) {
                                refSpan.append(",");
                            }
                        }
                        refSpan.append(".");
                        noteCell.append(refSpan);
                    }
                    row.append(noteCell);
                }
                // If contentious or rejected, say so
                if (status) {
                    row.className = status;
                }

                if (i < bravuraNames.length - 1) {
                    table.append(row);
                    row = document.createElement("tr");
                }
            }

            table.append(row);
        }

        categoryDiv.append(table);

        tablesDiv.append(categoryDiv);
    }

    select.onchange = function (e) {
        if (e.target.value === "All") {
            showAll();
        } else {
            showOnlyTable(e.target.value);
        }
    };
}

function showAll() {
    let tablesDiv = document.getElementById("tables");
    for (let categoryDiv of tablesDiv.children) {
        categoryDiv.style.display = "block";
    }
}

function showOnlyTable(category) {
    let tablesDiv = document.getElementById("tables");
    for (let categoryDiv of tablesDiv.children) {
        if (categoryDiv.value === category) {
            categoryDiv.style.display = "block";
        } else {
            categoryDiv.style.display = "none";
        }
    }
}

main();
