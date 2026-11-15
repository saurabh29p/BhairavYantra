# Deity images / देव-चित्र

Every image in this folder needs a record file next to it (`<name>.yaml`) following the Image
schema in `docs/00-concept.md` §4.7A. No record, no image.

## Owner's choices (2026-11-15)
- **Home page:** real images of **Śrī Baṭuka Bhairava** and **Mā Kālī**.
- **Deity galleries:** images from the **main temples of each deity**, plus museum objects and
  old public-domain plates where available.
- **Frame:** a **real yantra ring**, drawn only from a yantra described in a cited text.
- **Dedication:** only verses quoted verbatim from scripture, with source. Nothing composed.

## Worklist (status: candidates not yet found)
| # | For | What to look for | Status |
|---|---|---|---|
| 1 | Home | Baṭuka Bhairava: temple mūrti photo (e.g. Baṭuka Bhairava temple, Kāśī) or museum sculpture/painting | To find |
| 2 | Home | Mā Kālī: temple mūrti photo (e.g. Kālīghāṭ, Dakṣiṇeśvar) or museum sculpture/painting | To find |
| 3 | Kāla Bhairava | Kāla Bhairava temple, Vārāṇasī; Kāla Bhairava temple, Ujjain | To find |
| 4 | Aṣṭa Bhairavas | Temples associated with each of the eight (per research file 02) | Waiting on research |
| 5 | Daśa Mahāvidyās | Main temple per Mahāvidyā (per research file 09) | Waiting on research |

Which temples count as "main" for each deity must come from the research files (with
source), not from guesswork.

## Where to look
- Wikimedia Commons (check each file's licence and uploader).
- Museum open access: The Met (CC0), Cleveland Museum of Art (CC0), Art Institute of Chicago,
  LACMA, Rijksmuseum, British Museum (check terms per object).
- Public-domain plates: T. A. Gopinatha Rao, *Elements of Hindu Iconography* (1914–16).
- Temple-permitted photographs (your own, or with written permission).

## Candidate record template
```yaml
file: batuka-bhairava-kashi-01.jpg   # filled in only after approval
status: candidate                    # candidate → approved → added
depicts: [batuka-bhairava]
identified_by: source                # source | ours
identification_note: ""
object_type: murti                   # murti | relief | bronze | painting | manuscript | book-plate | photograph
material: ""
origin_place: ""
period: ""
period_grade: C
current_location: ""
accession_number: ""
source_url: ""
creator: ""
retrieved_on: ""
licence: ""                          # e.g. CC BY-SA 4.0 | CC0 | Public domain
licence_url: ""
attribution_text: ""
in_worship: true
inner_shrine: false
temple_permission: not-needed        # yes | no | not-needed
alt_en: ""
alt_hi: ""
```
