from typing import Optional

# Case-fatality rates for severe direct obstetric complications in West Africa, from the MOMA
# population-based cohort of 20,326 pregnant women in six West African countries:
#   Prual A, Bouvier-Colle MH, de Bernis L, Bréart G. "Severe maternal morbidity from direct
#   obstetric causes in West Africa: incidence and case fatality rates." Bull World Health Organ
#   2000;78(5):593-602.
#
# Only conditions with a rate that genuinely matches what this app's rules flag are mapped. MOMA
# reports eclampsia (18.4%) and uterine rupture (30.4%), but the app flags pre-eclampsia and
# obstructed labour, which are the earlier, far less lethal stages of those — using the later-stage
# rates would overstate the risk, so those two are deliberately left unestimated (None) rather than
# approximated. PPH uses MOMA's lower bound for haemorrhage (1.9% ante/peripartum; abruptio placentae
# was 3.7%), so the figure errs low.
CASE_FATALITY_RATE = {
    "PPH": 0.019,
    "SEPSIS": 0.333,
}

CASE_FATALITY_SOURCE = "Prual et al., Bull World Health Organ 2000;78(5):593-602 (MOMA study, West Africa)"


def case_fatality_rate(primary_condition: Optional[str]) -> Optional[float]:
    """The sourced case-fatality rate for a condition, or None when there's no rate that honestly
    matches it. This is the risk a referred woman faced — not a claim about deaths MAMA-AI averted,
    which would need outcome data (did she arrive, was she treated, did she survive) that the app
    doesn't collect yet."""
    return CASE_FATALITY_RATE.get(primary_condition or "")
