import json
import os
import yaml

vars = {}
with open('constants.yml', 'r') as file:
    vars = yaml.safe_load(file)

def prepare(data):
    result = {
        'emmentaler_version': vars['EMMENTALER_VERSION'],
        'smufl_version': vars['SMUFL_VERSION'],
        'glyphs': {},
    }

    for glyph_class in data:
        glyphs = glyph_class['glyphs']
        lily_names = glyphs.keys()

        for lily_name in lily_names:
            smufl_glyphs = glyphs[lily_name]
            if not isinstance(smufl_glyphs, list):
                smufl_glyphs = [smufl_glyphs]

            prepared_entries = []
            for smufl_glyph in smufl_glyphs:
                if isinstance(smufl_glyph, str):
                    prepared_entry = {'name': smufl_glyph}

                else:
                    smufl_name = smufl_glyph['name']

                    # If rejected or contentious, skip this glyph
                    if 'status' in smufl_glyph:
                        status = smufl_glyph['status']
                        if status in ['rejected', 'contentious']:
                            continue

                    prepared_entry = {
                        'name': smufl_name,
                        # 'classes': TODO
                    }

                    if 'altOf' in smufl_glyph:
                        prepared_entry['alternate_of'] = smufl_glyph['altOf']

                    if 'ligOf' in smufl_glyph:
                        prepared_entry['ligature_of'] = smufl_glyph['ligOf']

                prepared_entries.append(prepared_entry)

            if prepared_entries:
                result['glyphs'][lily_name] = prepared_entries

    return result



with open('lily-to-smufl.json', 'r') as file:
    data = json.load(file)

    release_data = prepare(data)

    if not os.path.isdir('release'): os.mkdir('release')
    release_file = open('release/lily-to-smufl.json', 'w')
    json.dump(release_data, release_file)
