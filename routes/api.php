<?php

use App\Http\Controllers\APIController;
use App\Http\Controllers\Audits\AuditReportController;
use App\Http\Controllers\Audits\AuditReportItemController;
use App\Http\Controllers\Audits\AuditReportTemplateItemController;
use App\Http\Controllers\Audits\AuditScheduleController;
use App\Http\Controllers\Audits\AuditTemplateClauseController;
use App\Http\Controllers\Audits\AuditTemplateController;
use App\Http\Controllers\Calibrations\CalibrationController;
use App\Http\Controllers\Calibrations\CalibrationLogController;
use App\Http\Controllers\Calibrations\CalibrationLogToolController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\CustomCodeController;
use App\Http\Controllers\Customers\CustomerController;
use App\Http\Controllers\Customers\CustomerSurveyController;
use App\Http\Controllers\Customers\CustomerSurveyQuestionController;
use App\Http\Controllers\Customers\CustomerSurveyTemplateController;
use App\Http\Controllers\Customers\CustomerSurveyTemplateQuestionController;
use App\Http\Controllers\Documentation\ClauseController;
use App\Http\Controllers\Documentation\QualityManualApprovalController;
use App\Http\Controllers\Documentation\QualityManualAttachmentController;
use App\Http\Controllers\Documentation\QualityManualController;
use App\Http\Controllers\Documentation\QualityManualElementController;
use App\Http\Controllers\Documentation\QualityManualLogController;
use App\Http\Controllers\Documentation\QualityManualRevisionController;
use App\Http\Controllers\Documentation\QualityProcedureAttachmentController;
use App\Http\Controllers\Documentation\QualityProcedureController;
use App\Http\Controllers\Documentation\QualityProcedureElementController;
use App\Http\Controllers\Documentation\QualityProcedureLogController;
use App\Http\Controllers\Documentation\QualityProcedureRevisionController;
use App\Http\Controllers\Documentation\QualityProcedureSectionController;
use App\Http\Controllers\Documents\DocumentController;
use App\Http\Controllers\Documents\DocumentFolderController;
use App\Http\Controllers\Documents\DocumentRevisionController;
use App\Http\Controllers\FormInputController;
use App\Http\Controllers\FormInputSourceController;
use App\Http\Controllers\FormInputTypeController;
use App\Http\Controllers\Forms\FormController;
use App\Http\Controllers\Forms\FormQuestionController;
use App\Http\Controllers\Forms\FormQuestionInputController;
use App\Http\Controllers\Forms\FormSectionController;
use App\Http\Controllers\Forms\FormTemplateController;
use App\Http\Controllers\Forms\FormTemplateQuestionController;
use App\Http\Controllers\Forms\FormTemplateQuestionInputController;
use App\Http\Controllers\Forms\FormTemplateScoreController;
use App\Http\Controllers\Forms\FormTemplateSectionController;
use App\Http\Controllers\GeneralLogController;
use App\Http\Controllers\Instructions\WorkInstructionApprovalController;
use App\Http\Controllers\Instructions\WorkInstructionController;
use App\Http\Controllers\Instructions\WorkInstructionElementController;
use App\Http\Controllers\Instructions\WorkInstructionLogController;
use App\Http\Controllers\Instructions\WorkInstructionRevisionController;
use App\Http\Controllers\JobDescriptions\JobDescriptionController;
use App\Http\Controllers\JobDescriptions\JobFunctionController;
use App\Http\Controllers\JobDescriptions\UserJobController;
use App\Http\Controllers\JobDescriptions\UserJobFunctionController;
use App\Http\Controllers\Maintenance\MaintenanceController;
use App\Http\Controllers\Maintenance\MaintenanceLogController;
use App\Http\Controllers\Maintenance\MaintenanceLogStepController;
use App\Http\Controllers\Maintenance\MaintenanceLogTemplateController;
use App\Http\Controllers\Maintenance\MaintenanceLogTemplateSpecificationController;
use App\Http\Controllers\Maintenance\MaintenanceLogTemplateStepController;
use App\Http\Controllers\MerchantController;
use App\Http\Controllers\ModuleSettingController;
use App\Http\Controllers\NonConformances\NonConformanceCodeController;
use App\Http\Controllers\NonConformances\NonConformanceController;
use App\Http\Controllers\NonConformances\NonConformanceInputController;
use App\Http\Controllers\NonConformances\NonConformanceLinkController;
use App\Http\Controllers\NonConformances\NonConformanceQuestionController;
use App\Http\Controllers\NonConformances\NonConformanceSectionController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\OpenAIController;
use App\Http\Controllers\ProcessController;
use App\Http\Controllers\Processes\ProcessProcedureController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\SpecificationController;
use App\Http\Controllers\StandardController;
use App\Http\Controllers\Suppliers\SupplierController;
use App\Http\Controllers\Suppliers\SupplierSurveyController;
use App\Http\Controllers\Suppliers\SupplierSurveyQuestionController;
use App\Http\Controllers\Suppliers\SupplierSurveySectionController;
use App\Http\Controllers\Suppliers\SupplierTemplateController;
use App\Http\Controllers\Suppliers\SupplierTemplateQuestionController;
use App\Http\Controllers\Suppliers\SupplierTemplateSectionController;
use App\Http\Controllers\Trainings\TrainingTemplateAttachmentController;
use App\Http\Controllers\Trainings\TrainingTemplateController;
use App\Http\Controllers\Trainings\TrainingTemplateQuestionController;
use App\Http\Controllers\Trainings\TrainingTemplateQuestionOptionController;
use App\Http\Controllers\Trainings\TrainingTemplateSectionController;
use App\Http\Controllers\Trainings\UserTrainingController;
use App\Http\Controllers\Trainings\UserTrainingQuestionController;
use App\Http\Controllers\Trainings\UserTrainingQuestionOptionController;
use App\Http\Controllers\Trainings\UserTrainingSectionController;
use App\Http\Controllers\Users\UserController;
use App\Http\Controllers\Trainings\AdhocTrainingTestController;
use App\Http\Controllers\Trainings\AdHocTrainingController;
use App\Http\Controllers\Trainings\AdhocTrainingUserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


Route::post('/login', [APIController::class, 'login'])->name('login');
Route::post('/register', [APIController::class, 'register']);
Route::post('/forget-password', [APIController::class, 'forget_pass']);
Route::post('/reset-password', [APIController::class, 'reset_pass']);
//user routes
Route::resource('/users', UserController::class);
Route::get('/user-list', [UserController::class, 'userList']);
Route::apiResource('/user-jobs', UserJobController::class);
Route::get('/training-dashboard-metrics', [UserJobController::class, 'getDashboardMetrics']);

Route::apiResource('/user-job-functions', UserJobFunctionController::class);
// Role Management
Route::get('/roles', [RolePermissionController::class, 'getRoles']);
Route::delete('/roles/{role}', [RolePermissionController::class, 'deleteRole']);
Route::delete('/permissions/{permission}', [RolePermissionController::class, 'deletePermission']);
Route::get('/roles/{role}/permissions', [RolePermissionController::class, 'getRolePermissions']);
Route::get('/permissions/{permission}/roles', [RolePermissionController::class, 'getPermissionRoles']);
// Permission Management
Route::get('/permissions', [RolePermissionController::class, 'getPermissions']);

// Assigning Roles & Permissions
// Protect role management routes with the `role:admin` middleware
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/roles', [RolePermissionController::class, 'createRole']);
    Route::post('/permissions', [RolePermissionController::class, 'createPermission']);
    Route::post('/roles/{role}/assign-permission', [RolePermissionController::class, 'assignPermissionToRole']);
    Route::post('/roles/{role}/remove-permission', [RolePermissionController::class, 'removePermissionFromRole']);

    Route::post('/permissions/{permission}/assign-role', [RolePermissionController::class, 'assignRoleToPermission']);
    Route::post('/permissions/{permission}/remove-role', [RolePermissionController::class, 'removeRoleFromPermission']);

    Route::post('/customer-surveys/review/{customerSurvey}', [CustomerSurveyController::class,'review']);
});

Route::post('/users/{user}/assign-role', [RolePermissionController::class, 'assignRoleToUser']);
Route::post('/users/{user}/remove-role', [RolePermissionController::class, 'removeRoleFromUser']);
Route::get('/users/{user}/roles', [RolePermissionController::class, 'getUserRoles']);
Route::post('/users/{user}/assign-permission', [RolePermissionController::class, 'assignPermissionToUser']);
Route::post('/users/{user}/remove-permission', [RolePermissionController::class, 'removePermissionFromUser']);
Route::get('/users/{user}/permissions', [RolePermissionController::class, 'getUserPermissions']);

//job description routes
Route::apiResource('/jobDescriptions', JobDescriptionController::class);
Route::get('/job-descriptions/org-chart', [JobDescriptionController::class, 'indexOrgChart']);
Route::post('/jobDescriptions/{jobDescription}/job-functions', [JobDescriptionController::class, 'storeJobFunctions']);
Route::post('/jobDescriptions/{jobDescription}/job-users', [JobDescriptionController::class, 'storeJobUsers']);
Route::apiResource('/job-functions', JobFunctionController::class);
Route::get('/job-descriptions/org-chart', [JobFunctionController::class, 'orgChart']);

//SIMPLE AI
Route::post('/generate', [OpenAIController::class, 'generate']);
Route::post('/generate-training', [OpenAIController::class, 'generateTraining']);
Route::post('/generate-job-description', [OpenAIController::class, 'generateJobDescription']);

Route::post('/generate-work-instruction', [OpenAIController::class, 'generateWorkInstruction']);
Route::post('/generate-maintenance-template', [OpenAIController::class, 'generateMaintenanceTemplate']);
Route::post('/generate-form-template', [OpenAIController::class, 'generateFormTemplate']);
Route::get('/generate-non-conformance', [OpenAIController::class, 'generateNonConformance']);
//calibration routes
Route::apiResource('/calibrations', CalibrationController::class);
Route::get('/calibration-dashboard-metrics', [CalibrationController::class, 'getDashboardMetrics']);
Route::get('/calibration-calendar-events', [CalibrationController::class, 'getCalendarEvents']);
Route::apiResource('/calibration-logs', CalibrationLogController::class);
Route::apiResource('/calibration-log-tools', CalibrationLogToolController::class);
//supplier routes
Route::apiResource('/suppliers', SupplierController::class);
Route::apiResource('/supplier-templates', SupplierTemplateController::class);
Route::apiResource('/supplier-template-sections', SupplierTemplateSectionController::class);
Route::apiResource('/supplier-template-questions', SupplierTemplateQuestionController::class);
Route::apiResource('/supplier-surveys', SupplierSurveyController::class);
Route::apiResource('/supplier-survey-sections', SupplierSurveySectionController::class);
Route::apiResource('/supplier-survey-questions', SupplierSurveyQuestionController::class);
//custom code routes
Route::apiResource('/custom-codes', CustomCodeController::class);
//customer routes
Route::apiResource('/customers', CustomerController::class);
Route::get('/customer-dashboard-metrics', [CustomerController::class, 'getDashboardMetrics']);
Route::get('/customer-sidebar-metrics', [CustomerController::class, 'getSidebarMetrics']);
Route::get('/calibration-sidebar-metrics', [CalibrationController::class, 'getSidebarMetrics']);
Route::apiResource('/customer-survey-templates', CustomerSurveyTemplateController::class);
Route::apiResource('/cs-template-questions', CustomerSurveyTemplateQuestionController::class);
Route::post('/cs-template-questions/reorder', [CustomerSurveyTemplateQuestionController::class, 'reorder']);
Route::apiResource('/customer-surveys', CustomerSurveyController::class);

Route::apiResource('/customer-survey-questions', CustomerSurveyQuestionController::class);
//maintenance routes
Route::apiResource('/maintenance', MaintenanceController::class);

Route::get('/maintenance-dashboard-metrics', [MaintenanceController::class, 'getDashboardMetrics']);
Route::get('/maintenance-sidebar-metrics', [MaintenanceController::class, 'getSidebarMetrics']);
Route::get('/maintenance-calendar-events', [MaintenanceController::class, 'getCalendarEvents']);

Route::apiResource('/maintenance-logs', MaintenanceLogController::class);
Route::apiResource('/maintenance-log-steps', MaintenanceLogStepController::class);
Route::apiResource('/maintenance-log-templates', MaintenanceLogTemplateController::class);
Route::apiResource('/maintenance-log-template-steps', MaintenanceLogTemplateStepController::class);
Route::apiResource('/ml-template-specs', MaintenanceLogTemplateSpecificationController::class);
Route::post('/maintenance-service-calls', [MaintenanceLogController::class, 'storeServiceCall']);
Route::put('/maintenance-service-calls/{maintenanceLog}', [MaintenanceLogController::class, 'updateServiceCall']);

//specification routes
Route::resource('/specifications', SpecificationController::class);

//training routes
Route::apiResource('/training-templates', TrainingTemplateController::class);
Route::get('/training-templates/{trainingTemplate}/show-everything', [TrainingTemplateController::class, 'showEverything']);
Route::apiResource('/training-template-sections', TrainingTemplateSectionController::class);
Route::apiResource('/training-template-questions', TrainingTemplateQuestionController::class);
Route::post('/training-template-questions/swap', [TrainingTemplateQuestionController::class, 'swap']);
Route::apiResource('/tt-question-options', TrainingTemplateQuestionOptionController::class);
Route::apiResource('/training-template-attachments', TrainingTemplateAttachmentController::class);
Route::apiResource('/module-settings', ModuleSettingController::class);

// Ad-hoc training routes

Route::apiResource('/adhoc-trainings', AdHocTrainingController::class);
Route::apiResource('/adhoc-training-tests', AdhocTrainingTestController::class);
Route::apiResource('adhoc-training-users', AdhocTrainingUserController::class);

//document routes
Route::apiResource('/document-folders', DocumentFolderController::class);
Route::apiResource('/documents', DocumentController::class);
Route::post('/document-model-upload', [DocumentController::class, 'storeModel']);

Route::apiResource('/document-revisions', DocumentRevisionController::class);
Route::get(
    '/{module}/{modelType}/{modelId}/documents',
    [DocumentController::class, 'forModel']
)->where([
            'module' => '[a-z0-9\-]+',
            'modelType' => '[a-z0-9\-]+',
            'modelId' => '[0-9]+',
        ]);
//general log routes
Route::apiResource('/general-logs', GeneralLogController::class);

//documentation routes
Route::apiResource('/standards', StandardController::class);
Route::apiResource('/clauses', ClauseController::class);
Route::get('/clause-by-standard/{standard}', [ClauseController::class, 'indexByStandard']);

Route::apiResource('/quality-manuals', QualityManualController::class);
Route::apiResource('/quality-manual-revisions', QualityManualRevisionController::class);
Route::apiResource('/quality-manual-approvals', QualityManualApprovalController::class);
Route::apiResource('/quality-manual-elements', QualityManualElementController::class);
Route::apiResource('/quality-manual-logs', QualityManualLogController::class);
Route::apiResource('/quality-manual-attachments', QualityManualAttachmentController::class);
Route::apiResource('/quality-procedures', QualityProcedureController::class);
Route::apiResource('/quality-procedure-revisions', QualityProcedureRevisionController::class);
Route::apiResource('/quality-procedure-sections', QualityProcedureSectionController::class);
Route::apiResource('/quality-procedure-elements', QualityProcedureElementController::class);
Route::post('/quality-procedure-elements/reorder', [QualityProcedureElementController::class, 'reorder']);
Route::apiResource('/quality-procedure-attachments', QualityProcedureAttachmentController::class);
Route::apiResource('/quality-procedure-logs', QualityProcedureLogController::class);

//module routes
Route::apiResource('/module-settings', ModuleSettingController::class);


Route::post('/module-settings/reset', [ModuleSettingController::class, 'reset']);
Route::post('/module-settings/update-module-value', [ModuleSettingController::class, 'updateModuleValue']);
Route::post('/module-settings/save', [ModuleSettingController::class, 'updateOrCreatSettings']);


//non conformance routes
Route::apiResource('/non-conformance-codes', NonConformanceCodeController::class);
Route::apiResource('/non-conformance-inputs', NonConformanceInputController::class);
Route::post('/non-conformance-inputs/reorder', [NonConformanceInputController::class, 'reorder']);
Route::apiResource('/non-conformance-links', NonConformanceLinkController::class);
Route::post('/non-conformance-links/reorder', [NonConformanceLinkController::class, 'reorder']);
Route::apiResource('/non-conformances', NonConformanceController::class);
Route::apiResource('/non-conformance-sections', NonConformanceSectionController::class);
Route::apiResource('/non-conformance-questions', NonConformanceQuestionController::class);
Route::post('/non-conformances/{nonConformance}/sections', [NonConformanceController::class, 'storeSection']);
Route::put('/non-conformance-sections/{nonConformanceSection}/questions', [NonConformanceSectionController::class, 'storeQuestion']);
Route::get('/non-conformance-show-everything/{nonConformance}', [NonConformanceController::class, 'showEverything']);
Route::post('/non-conformances/{nonConformance}/ai-store', [NonConformanceController::class, 'storeAiScenario']);

//form inputs
Route::apiResource('/form-inputs', FormInputController::class);
Route::get('/form-input-select', [FormInputController::class, 'selectList']);
Route::get('/form-input-sources', [FormInputSourceController::class, 'index']);

Route::apiResource('/form-template-sections', FormTemplateSectionController::class);
Route::apiResource('/form-template-question-inputs', FormTemplateQuestionInputController::class);
Route::get('/form-template-show-all/{formTemplate}', [FormTemplateController::class, 'showForPrompt']);
Route::apiResource('form-template-scores', FormTemplateScoreController::class);
Route::apiResource('/forms', FormController::class);
Route::apiResource('/form-sections', FormSectionController::class);
Route::apiResource('/form-questions', FormQuestionController::class);
Route::apiResource('/form-question-inputs', FormQuestionInputController::class);
Route::post('/form-question-evidence', [FormQuestionInputController::class, 'saveEvidenceSamples']);

// Process routes
Route::apiResource('/processes', ProcessController::class);
Route::apiResource('/process-procedures', ProcessProcedureController::class);

//audit routes
Route::apiResource('/audit-templates', AuditTemplateController::class);
Route::apiResource('/audit-template-clauses', AuditTemplateClauseController::class);

//contact routes
Route::apiResource('/contacts', ContactController::class);

//notes routes
Route::apiResource('/notes', NoteController::class);

//work instructions routes
Route::apiResource('/work-instructions', WorkInstructionController::class);
Route::apiResource('/work-instruction-revisions', WorkInstructionRevisionController::class);
Route::apiResource('/work-instruction-elements', WorkInstructionElementController::class);
Route::apiResource('/work-instruction-approvals', WorkInstructionApprovalController::class);
Route::apiResource('/work-instruction-logs', WorkInstructionLogController::class);

//attachments routes
Route::apiResource('/attachments', \App\Http\Controllers\AttachmentController::class);

//user training routes

Route::apiResource('/user-training-sections', UserTrainingSectionController::class);
Route::apiResource('/user-training-questions', UserTrainingQuestionController::class);
Route::apiResource('/user-training-question-options', UserTrainingQuestionOptionController::class);

//form templates

Route::middleware(['auth:sanctum'])->group(function () {
    // Audit Routes
    Route::apiResource('audit-schedules', \App\Http\Controllers\Audits\AuditScheduleController::class);
    Route::apiResource('audit-runs', \App\Http\Controllers\Audits\AuditRunController::class);
    Route::apiResource('/audit-reports', AuditReportController::class);
    Route::apiResource('/audit-report-template-items', AuditReportTemplateItemController::class);
    Route::apiResource('/audit-report-items', AuditReportItemController::class);
    Route::apiResource('/user-trainings', UserTrainingController::class);
    Route::get('/learning-center', [UserTrainingController::class, 'learningCenter']);

    //Form Templates
    Route::apiResource('/form-template-questions', FormTemplateQuestionController::class);

    //Form inputs
    Route::apiResource('/form-input-types', FormInputTypeController::class);

    Route::get('/audit-dashboard-metrics', [AuditScheduleController::class, 'getDashboardMetrics']);

    Route::apiResource('/form-templates', FormTemplateController::class);

    Route::apiResource('/merchants', MerchantController::class);

});
