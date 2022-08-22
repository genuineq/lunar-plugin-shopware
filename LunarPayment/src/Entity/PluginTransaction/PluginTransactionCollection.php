<?php declare(strict_types=1);

namespace LunarPayment\Entity\PluginTransaction;

use Shopware\Core\Framework\DataAbstractionLayer\EntityCollection;

/**
 * Manage plugin transactions collection
 *
 * @method void                   add(PluginTransaction $entity)
 * @method void                   set(string $key, PluginTransaction $entity)
 * @method PluginTransaction[]    getIterator()
 * @method PluginTransaction[]    getElements()
 * @method PluginTransaction|null get(string $key)
 * @method PluginTransaction|null first()
 * @method PluginTransaction|null last()
 */
class PluginTransactionCollection extends EntityCollection
{
    protected function getExpectedClass(): string
    {
        return PluginTransaction::class;
    }
}