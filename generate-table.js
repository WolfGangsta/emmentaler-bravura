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

    for (let category of data) {
        let header = document.createElement("h2");
        header.innerText = category.name + " glyphs";
        tablesDiv.append(header);

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
            let bravInfoSpan = document.createElement("span");
            bravInfoSpan.innerHTML = emmenName;
            emmenEntry.append(bravInfoSpan);
            col1.append(emmenEntry);

            // Second column (Emmentaler glyph)
            let col2 = document.createElement("td");
            col2.className = "first lily-side emmentaler";
            if (code === 0) col2.className += " new";

            col2.innerHTML = String.fromCodePoint(code);

            col1.rowSpan = col2.rowSpan = bravuraNames.length;
            row.append(col1, col2);

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

                let code = 0;
                if (!glyphNames[bravName]) {
                    if (bravuraMetadata.optionalGlyphs[bravName]) {
                        let str = bravuraMetadata.optionalGlyphs[bravName].codepoint;
                        code = Number.parseInt(str.slice(2), 16);
                        row.className = "optional-in-bravura";
                    } else {
                        row.className = "new-to-smufl";
                    }
                } else {
                    let str = glyphNames[bravName].codepoint;
                    code = Number.parseInt(str.slice(2), 16);
                    row.className = "smufl-recommended";
                }

                // Third column (Bravura glyph)
                let cell3 = document.createElement("td");
                cell3.className = "bravura";
                if (i === 0) cell3.className += " first";
                cell3.innerHTML = String.fromCodePoint(code);

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

                // Put notes here
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

        tablesDiv.append(table);
    }
}

main();
