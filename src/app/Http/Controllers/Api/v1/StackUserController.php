<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Traits\LogHelper;
use App\User;
use App\Stack;
use Exception;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use function response;

class StackUserController
{
    use LogHelper;
    
    /**
     * Display a listing of the stacks.
     *
     * @return Response
     */
    public function index($user_id)
    {
        $data = [];
        
        try {

            $data = Stack::select(['id', 'name'])->with(
                [
                    'users' => function($query) {
                        return $query->select(['id', 'name'])->take(3);
                    }
                ])->get(['count(users) as count']);
            
        } catch (Exception $exc) {
            $this->logException($exc);
            return response()->json([ 'message' => 'There was an error retrieving the records' ], 500);
        }

        return $data;
    }
}
