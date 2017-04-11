<?php

namespace App\Http\Traits;

use Illuminate\Support\Facades\Log;

/**
 * Helper functions for logging
 */
trait LogHelper
{
    function logException($exc)
    {
        Log::error($exc->getFile() . ' line: ' . $exc->getLine() . ' ' . $exc->getMessage());
    }
}
