<?php
namespace App\Console\Commands;

use DB;
use Illuminate\Console\Command;

class DropTablesCommand extends Command
{

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'droptables';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Deletes all your tables from DB';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {

        if (!$this->confirm('CONFIRM DROP AL TABLES IN THE CURRENT DATABASE? [y|N]')) {
            exit('Drop Tables command aborted');
        }

        $query = 'SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname=\'public\'';
        $tables = array_column(DB::select($query), 'tablename');

        foreach ($tables as $table) {
            DB::statement('drop table ' . $table . ' cascade');
        }

        $this->comment(PHP_EOL . "If no errors showed up, all tables were dropped" . PHP_EOL);
    }
}
