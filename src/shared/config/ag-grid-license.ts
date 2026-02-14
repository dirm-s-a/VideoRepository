import { LicenseManager } from 'ag-grid-enterprise';

// Licencia: CLINICA DIM RIVADAVIA S.A. - Multiple Applications Developer License
// Valida hasta: 2 February 2027
const AG_GRID_LICENSE_KEY = 'Using_this_{AG_Grid}_Enterprise_key_{AG-119866}_in_excess_of_the_licence_granted_is_not_permitted___Please_report_misuse_to_legal@ag-grid.com___For_help_with_changing_this_key_please_contact_info@ag-grid.com___{CLINICA_DIM_RIVADAVIA_S.A.}_is_granted_a_{Multiple_Applications}_Developer_License_for_{1}_Front-End_JavaScript_developer___All_Front-End_JavaScript_developers_need_to_be_licensed_in_addition_to_the_ones_working_with_{AG_Grid}_Enterprise___This_key_has_not_been_granted_a_Deployment_License_Add-on___This_key_works_with_{AG_Grid}_Enterprise_versions_released_before_{2_February_2027}____[v3]_[01]_MTgwMTUyNjQwMDAwMA==1d1d8da3d5f6b38650e56a4d49534bcd';

export function setupAgGridLicense() {
  LicenseManager.setLicenseKey(AG_GRID_LICENSE_KEY);
}
