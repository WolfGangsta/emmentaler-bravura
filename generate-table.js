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

    for (let entry of data) {
        let header = document.createElement("h2");
        header.innerText = entry.name + " glyphs";
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

        for (let emmenName in entry.glyphs) {
            let bravuraNames = entry.glyphs[emmenName];
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
            col1.className = "first lily-side";
            if (code === 0) col1.className += " new";

            let emmenEntry = document.createElement("span");
            emmenEntry.className = "glyph-entry";
            let bravNameSpan = document.createElement("span");
            bravNameSpan.innerHTML = emmenName;
            emmenEntry.append(bravNameSpan);
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
                let note, contentious, altOf, ligOf;
                if (typeof bravName === "object") {
                    note = bravName.note;
                    contentious = bravName.contentious;
                    altOf = bravName.altOf;
                    ligOf = bravName.ligOf;

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
                bravNameSpan = document.createElement("span");
                bravNameSpan.innerText = bravName;
                bravEntry.append(bravNameSpan);
                if (altOf) {
                    let altI = document.createElement("i");
                    altI.innerText = " (alternate of " + altOf + ")";
                    bravEntry.append(altI);
                }
                if (ligOf) {
                    let ligI = document.createElement("i");
                    let list = ligOf.join(" + ")
                    ligI.innerText = " (ligature: " + list + ")";
                    bravEntry.append(ligI);
                }
                cell4.append(bravEntry);

                row.append(cell3, cell4);

                // Put notes here
                if (note) {
                    let noteCell = document.createElement("td");
                    noteCell.className = "contention";
                    noteCell.innerHTML = note;
                    row.append(noteCell);
                }
                // Contentious?
                if (contentious) {
                    row.className = "contentious";
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
