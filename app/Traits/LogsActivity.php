<?php

// app/Traits/LogsActivity.php
namespace App\Traits;

use App\Models\GeneralLog;
use Illuminate\Support\Facades\Auth;

trait LogsActivity
{
    /**
     * Log an activity.
     *
     * @param string $module The module used (e.g. "Investigation")
     * @param string $title
     * @param string $description A description of the activity.
     * @param string $location
     * @param mixed|null $model Optional model instance related to the action.
     */
    public function logActivity(string $module, string $title, string $description, string $location, mixed $model = null)
    {
        GeneralLog::create([
            'model' => $model ? get_class($model) : null,
            'model_id'   => $model ? $model->id : null,
            'module'     => $module,
            'title'      => $title,
            'description'=> $description,
            'location'   => $location,
            'user_id'    => Auth::id() ?? 1,
        ]);
    }
}
